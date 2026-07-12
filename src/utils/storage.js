import { createClient } from '@supabase/supabase-js';

export function safeParseJson(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

// 1. Supabase Client Setup (falls back to kvdb if env keys are missing)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 2. kvdb Fallback Config
const BUCKET_URL = 'https://kvdb.io/J6e3PPhwXzgPjqkPLRTxnk';

// 3. Supabase Table mapping configurations
const TABLE_MAP = {
  'registeredUsers': 'registered_users',
  'sreeraam_projects': 'projects',
  'sreeraam_divisions': 'divisions',
  'sreeraam_about_milestones': 'milestones',
  'sreeraam_careers_jobs': 'jobs',
  'sreeraam_inquiries': 'inquiries',
  'sreeraam_job_applications': 'job_applications',
  'sreeraam_chat_messages': 'chat_messages'
};

function getTableConfig(key) {
  if (TABLE_MAP[key]) {
    return { table: TABLE_MAP[key], type: 'collection' };
  }
  if (key === 'sreeraam_notifications_admin') {
    return { table: 'notifications', type: 'filtered', filter: { role: 'admin' } };
  }
  if (key.startsWith('sreeraam_notifications_client_')) {
    const email = key.replace('sreeraam_notifications_client_', '').toLowerCase();
    return { table: 'notifications', type: 'filtered', filter: { role: 'client', owner_email: email } };
  }
  return null;
}

// Translate camelCase Javascript keys to snake_case Postgres columns
function toDbRow(key, item) {
  const row = { ...item };
  
  if ('desc' in row) {
    row.description = row.desc;
    delete row.desc;
  }
  
  if (key === 'sreeraam_chat_messages') {
    if ('clientEmail' in row) row.client_email = row.clientEmail;
    if ('clientName' in row) row.client_name = row.clientName;
    delete row.clientEmail;
    delete row.clientName;
  }
  
  if (key === 'sreeraam_notifications_admin' || key.startsWith('sreeraam_notifications_client_')) {
    if ('ownerEmail' in row) row.owner_email = row.ownerEmail;
    if ('iconName' in row) row.icon_name = row.iconName;
    delete row.ownerEmail;
    delete row.iconName;
  }
  
  return row;
}

// Translate snake_case Postgres columns to camelCase Javascript keys
function fromDbRow(key, row) {
  const item = { ...row };
  delete item.created_at;

  if ('description' in item) {
    item.desc = item.description;
    delete item.description;
  }
  
  if (key === 'sreeraam_chat_messages') {
    if ('client_email' in item) item.clientEmail = item.client_email;
    if ('client_name' in item) item.clientName = item.client_name;
    delete item.client_email;
    delete item.client_name;
  }
  
  if (key === 'sreeraam_notifications_admin' || key.startsWith('sreeraam_notifications_client_')) {
    if ('owner_email' in item) item.ownerEmail = item.owner_email;
    if ('icon_name' in item) item.iconName = item.icon_name;
    delete item.owner_email;
    delete item.icon_name;
  }
  
  return item;
}

// Write locally, then push to Supabase (or fallback to kvdb)
export function saveLocalAndCloud(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  
  // Notify local components immediately
  window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data } }));

  // Push to cloud asynchronously
  if (supabase) {
    const config = getTableConfig(key);
    if (config) {
      const { table, type, filter } = config;
      
      (async () => {
        let queryDel = supabase.from(table).delete();
        if (type === 'filtered') {
          Object.keys(filter).forEach(k => { queryDel = queryDel.eq(k, filter[k]); });
        } else {
          queryDel = queryDel.neq('id', 0);
        }
        await queryDel;

        if (data.length > 0) {
          const rowsToInsert = data.map(item => {
            let r = toDbRow(key, item);
            if (type === 'filtered') r = { ...r, ...filter };
            return r;
          });
          await supabase.from(table).insert(rowsToInsert);
        }
      })().catch(err => console.warn(`Supabase save failed for ${key}:`, err));
      return;
    }
  }

  // Fallback to kvdb
  fetch(`${BUCKET_URL}/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.warn(`kvdb fallback push failed for ${key}:`, err));
}

// Background sync from Supabase (or fallback to kvdb) to local
export async function syncKeyFromCloud(key, fallback = []) {
  try {
    if (supabase) {
      const config = getTableConfig(key);
      if (config) {
        const { table, type, filter } = config;
        let query = supabase.from(table).select('*');
        if (type === 'filtered') {
          Object.keys(filter).forEach(k => { query = query.eq(k, filter[k]); });
        }
        const { data: rows, error } = await query.order('id', { ascending: true });
        if (!error && rows) {
          const cloudData = rows.map(r => fromDbRow(key, r));
          const localRaw = localStorage.getItem(key);
          if (localRaw !== JSON.stringify(cloudData)) {
            localStorage.setItem(key, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: cloudData } }));
          }
          return cloudData;
        }
      }
    }

    // Fallback to kvdb
    const res = await fetch(`${BUCKET_URL}/${key}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim()) {
        const parsed = JSON.parse(text);
        const cloudData = Array.isArray(parsed) ? parsed : fallback;
        const localRaw = localStorage.getItem(key);
        if (localRaw !== JSON.stringify(cloudData)) {
          localStorage.setItem(key, JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: cloudData } }));
        }
        return cloudData;
      }
    }
  } catch (err) {
    console.warn(`Cloud sync read failed for ${key}:`, err);
  }
  return asArray(safeParseJson(localStorage.getItem(key), fallback), fallback);
}

// Safely initialize a key with fallback defaults without overwriting existing cloud data
export async function initializeDb(key, defaults = []) {
  try {
    const localRaw = localStorage.getItem(key);

    if (supabase) {
      const config = getTableConfig(key);
      if (config) {
        const { table, type, filter } = config;
        let query = supabase.from(table).select('*');
        if (type === 'filtered') {
          Object.keys(filter).forEach(k => { query = query.eq(k, filter[k]); });
        }
        const { data: rows, error } = await query.limit(1);
        
        if (!error && rows && rows.length > 0) {
          // Supabase has active records! Pull all rows and save locally.
          let fetchQuery = supabase.from(table).select('*');
          if (type === 'filtered') {
            Object.keys(filter).forEach(k => { fetchQuery = fetchQuery.eq(k, filter[k]); });
          }
          const { data: allRows } = await fetchQuery.order('id', { ascending: true });
          if (allRows) {
            const parsed = allRows.map(r => fromDbRow(key, r));
            localStorage.setItem(key, JSON.stringify(parsed));
            window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: parsed } }));
            return;
          }
        }

        // Supabase has no data
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (key === 'registeredUsers' && Array.isArray(parsed) && !parsed.some(u => u.email.toLowerCase() === 'kumar@mail.com')) {
            parsed.push({ name: 'Kumar', email: 'kumar@mail.com', phone: '9876543210', password: 'password' });
          }
          const dataToSave = Array.isArray(parsed) ? parsed : defaults;
          
          let queryDel = supabase.from(table).delete();
          if (type === 'filtered') {
            Object.keys(filter).forEach(k => { queryDel = queryDel.eq(k, filter[k]); });
          } else {
            queryDel = queryDel.neq('id', 0);
          }
          await queryDel;

          if (dataToSave.length > 0) {
            const rowsToInsert = dataToSave.map(item => {
              let r = toDbRow(key, item);
              if (type === 'filtered') r = { ...r, ...filter };
              return r;
            });
            await supabase.from(table).insert(rowsToInsert);
          }
          localStorage.setItem(key, JSON.stringify(dataToSave));
          return;
        }

        // Both are empty. Seed defaults.
        let queryDel = supabase.from(table).delete();
        if (type === 'filtered') {
          Object.keys(filter).forEach(k => { queryDel = queryDel.eq(k, filter[k]); });
        } else {
          queryDel = queryDel.neq('id', 0);
        }
        await queryDel;

        if (defaults.length > 0) {
          const rowsToInsert = defaults.map(item => {
            let r = toDbRow(key, item);
            if (type === 'filtered') r = { ...r, ...filter };
            return r;
          });
          await supabase.from(table).insert(rowsToInsert);
        }
        localStorage.setItem(key, JSON.stringify(defaults));
        window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: defaults } }));
        return;
      }
    }

    // Fallback to kvdb
    const res = await fetch(`${BUCKET_URL}/${key}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim()) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          if (localRaw !== JSON.stringify(parsed)) {
            localStorage.setItem(key, JSON.stringify(parsed));
            window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: parsed } }));
          }
          return;
        }
      }
    }

    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (key === 'registeredUsers' && Array.isArray(parsed) && !parsed.some(u => u.email.toLowerCase() === 'kumar@mail.com')) {
        parsed.push({ name: 'Kumar', email: 'kumar@mail.com', phone: '9876543210', password: 'password' });
      }
      const dataToSave = Array.isArray(parsed) ? parsed : defaults;
      await fetch(`${BUCKET_URL}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      localStorage.setItem(key, JSON.stringify(dataToSave));
      return;
    }

    localStorage.setItem(key, JSON.stringify(defaults));
    await fetch(`${BUCKET_URL}/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaults)
    });
    window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: defaults } }));
  } catch (err) {
    console.warn(`Failed to initialize database for ${key}:`, err);
  }
}

// Start continuous sync loop
let syncInterval = null;
export function startDbSync(keys = []) {
  if (syncInterval) clearInterval(syncInterval);
  
  const performSync = () => {
    keys.forEach(key => {
      syncKeyFromCloud(key);
    });
  };

  // Run initial sync
  performSync();
  
  // Poll every 3 seconds for background changes
  syncInterval = setInterval(performSync, 3000);
  return () => clearInterval(syncInterval);
}
