// Build: 2026-07-12 — Force fresh Vercel build to pick up Supabase env vars
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

// Supabase Client Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[storage.js] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing! ' +
    'Add them to your .env file locally and to Vercel Environment Variables in production.'
  );
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Supabase Table mapping configurations
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

  // Strip frontend-only temporary UI states
  delete row.typeField;

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

// Write locally, then push to Supabase
export function saveLocalAndCloud(key, data) {
  localStorage.setItem(key, JSON.stringify(data));

  // Notify local components immediately
  window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data } }));

  if (!supabase) {
    console.warn(`[storage.js] saveLocalAndCloud: Supabase not configured. Data for "${key}" saved locally only.`);
    return;
  }

  const config = getTableConfig(key);
  if (!config) {
    console.warn(`[storage.js] saveLocalAndCloud: No table config found for key "${key}".`);
    return;
  }

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
      const { error } = await supabase.from(table).insert(rowsToInsert);
      if (error) console.error(`[storage.js] Supabase insert failed for "${key}":`, error);
    }
  })().catch(err => console.error(`[storage.js] saveLocalAndCloud failed for "${key}":`, err));
}

// Sync from Supabase to local storage
export async function syncKeyFromCloud(key, fallback = []) {
  if (!supabase) {
    return asArray(safeParseJson(localStorage.getItem(key), fallback), fallback);
  }

  try {
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
      } else if (error) {
        console.error(`[storage.js] syncKeyFromCloud error for "${key}":`, error);
      }
    }
  } catch (err) {
    console.error(`[storage.js] syncKeyFromCloud exception for "${key}":`, err);
  }

  return asArray(safeParseJson(localStorage.getItem(key), fallback), fallback);
}

// Safely initialize a key with defaults without overwriting existing cloud data
export async function initializeDb(key, defaults = []) {
  if (!supabase) {
    console.warn(`[storage.js] initializeDb: Supabase not configured. Using localStorage only for "${key}".`);
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaults));
      window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: defaults } }));
    }
    return;
  }

  try {
    const localRaw = localStorage.getItem(key);
    const config = getTableConfig(key);

    if (!config) {
      if (!localRaw) {
        localStorage.setItem(key, JSON.stringify(defaults));
        window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: defaults } }));
      }
      return;
    }

    const { table, type, filter } = config;
    let query = supabase.from(table).select('*');
    if (type === 'filtered') {
      Object.keys(filter).forEach(k => { query = query.eq(k, filter[k]); });
    }
    const { data: rows, error } = await query.limit(1);

    if (error) {
      console.error(`[storage.js] initializeDb check failed for "${key}":`, error);
      if (!localRaw) {
        localStorage.setItem(key, JSON.stringify(defaults));
        window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: defaults } }));
      }
      return;
    }

    if (rows && rows.length > 0) {
      // Supabase has records → pull all and update local cache
      let fetchQuery = supabase.from(table).select('*');
      if (type === 'filtered') {
        Object.keys(filter).forEach(k => { fetchQuery = fetchQuery.eq(k, filter[k]); });
      }
      const { data: allRows } = await fetchQuery.order('id', { ascending: true });
      if (allRows) {
        const parsed = allRows.map(r => fromDbRow(key, r));
        localStorage.setItem(key, JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: parsed } }));
      }
      return;
    }

    // Supabase table is empty
    const parsedLocal = localRaw ? safeParseJson(localRaw, null) : null;
    const localIsEmpty = parsedLocal === null || (Array.isArray(parsedLocal) && parsedLocal.length === 0);

    const dataToSeed = localIsEmpty ? defaults : (Array.isArray(parsedLocal) ? parsedLocal : defaults);

    // Delete existing (safety measure) then seed
    let queryDel = supabase.from(table).delete();
    if (type === 'filtered') {
      Object.keys(filter).forEach(k => { queryDel = queryDel.eq(k, filter[k]); });
    } else {
      queryDel = queryDel.neq('id', 0);
    }
    await queryDel;

    if (dataToSeed.length > 0) {
      const rowsToInsert = dataToSeed.map(item => {
        let r = toDbRow(key, item);
        if (type === 'filtered') r = { ...r, ...filter };
        return r;
      });
      const { error: insertErr } = await supabase.from(table).insert(rowsToInsert);
      if (insertErr) console.error(`[storage.js] initializeDb seed failed for "${key}":`, insertErr);
    }

    localStorage.setItem(key, JSON.stringify(dataToSeed));
    window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: dataToSeed } }));
  } catch (err) {
    console.error(`[storage.js] initializeDb exception for "${key}":`, err);
  }
}

// Start continuous sync loop
let syncInterval = null;
export function startDbSync(keys = []) {
  if (syncInterval) clearInterval(syncInterval);

  const performSync = () => {
    keys.forEach(key => { syncKeyFromCloud(key); });
  };

  performSync();

  // Poll every 5 seconds for background changes
  syncInterval = setInterval(performSync, 5000);
  return () => clearInterval(syncInterval);
}
