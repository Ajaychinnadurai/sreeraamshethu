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
// Note: The anon key is a public-safe key controlled by Supabase RLS policies.
// It is intentionally hardcoded here to avoid Vercel build-time env var issues.
const SUPABASE_URL = 'https://xfjbldhifbchdqvumovl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmamJsZGhpZmJjaGRxdnVtb3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MjM1ODIsImV4cCI6MjA5OTM5OTU4Mn0.-f1gYaMcbdTgkGYaH7OHBBKdjaaFA2YZqhSBilFRW-A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    return { table: 'notifications', type: 'filtered', filter: { role: 'client', owneremail: email } };
  }
  return null;
}

// Translate camelCase Javascript keys to snake_case Postgres columns
function toDbRow(key, item) {
  const row = { ...item };

  // Strip frontend-only temporary UI states
  delete row.typeField;

  // ── UNIVERSAL FIXES (apply to ALL data types) ──

  // 1. Ensure 'id' is always an integer (bigint columns reject floats)
  //    Some code uses Date.now() + Math.random() which creates a float
  if ('id' in row) {
    row.id = Math.floor(row.id);
  }

  // 2. Ensure 'read' field has a default if it's a required column
  //    chat_messages and notifications tables have NOT NULL on read
  if (key === 'sreeraam_chat_messages' ||
      key === 'sreeraam_notifications_admin' ||
      key.startsWith('sreeraam_notifications_client_')) {
    if (!('read' in row) || row.read === null || row.read === undefined) {
      row.read = false;
    }
  }

  // ── KEY-SPECIFIC FIXES ──

  // Ensure required fields for registered_users table
  if (key === 'registeredUsers') {
    // Generate a unique id if not present (Postgres expects non-null id)
    if (!row.id) {
      row.id = Math.floor(Date.now() + ((row.email) ? row.email.length : 0));
    }
    // Default role to 'client' if not set
    if (!row.role) {
      row.role = 'client';
    }
  }

  if ('desc' in row) {
    row.description = row.desc;
    delete row.desc;
  }

  if (key === 'sreeraam_chat_messages') {
    if ('clientEmail' in row) row.clientemail = row.clientEmail;
    if ('clientName' in row) row.clientname = row.clientName;
    delete row.clientEmail;
    delete row.clientName;

    // Serialize attachment/reactions into text column to bypass missing columns in Supabase
    if (row.attachment || row.reactions) {
      const chatPayload = {
        text: row.text,
        attachment: row.attachment || null,
        reactions: row.reactions || null
      };
      row.text = `__CHAT_JSON__:${JSON.stringify(chatPayload)}`;
    }
    delete row.attachment;
    delete row.reactions;
  }

  if (key === 'sreeraam_notifications_admin' || key.startsWith('sreeraam_notifications_client_')) {
    if ('ownerEmail' in row) row.owneremail = row.ownerEmail;
    if ('iconName' in row) row.iconname = row.iconName;
    delete row.ownerEmail;
    delete row.iconName;

    // Default required Postgres fields to satisfy NOT NULL constraints
    if (!row.date) row.date = 'Just now';
    if (!row.time) row.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!row.iconname) row.iconname = 'bell';
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

  if (key === 'registeredUsers') {
    // Ensure role is preserved when syncing from cloud
    if (!item.role) item.role = 'client';
  }

  if (key === 'sreeraam_chat_messages') {
    if ('clientemail' in item) item.clientEmail = item.clientemail;
    if ('clientname' in item) item.clientName = item.clientname;
    delete item.clientemail;
    delete item.clientname;

    // Deserialize attachment/reactions from text column if packaged as JSON
    if (item.text && item.text.startsWith('__CHAT_JSON__:')) {
      try {
        const payload = JSON.parse(item.text.substring('__CHAT_JSON__:'.length));
        item.text = payload.text;
        item.attachment = payload.attachment;
        item.reactions = payload.reactions;
      } catch (e) {
        console.warn('Failed to parse chat JSON payload:', e);
      }
    }
  }

  if (key === 'sreeraam_notifications_admin' || key.startsWith('sreeraam_notifications_client_')) {
    if ('owneremail' in item) item.ownerEmail = item.owneremail;
    if ('iconname' in item) item.iconName = item.iconname;
    delete item.owneremail;
    delete item.iconname;
  }

  return item;
}

// Write locally, then push to Supabase (best-effort, never blocks the app)
export function saveLocalAndCloud(key, data) {
  // Always save locally first — the app works without Supabase
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data } }));

  if (!supabase) return;

  const config = getTableConfig(key);
  if (!config) return;

  const { table, type, filter } = config;

  // Fire-and-forget: Supabase sync is best-effort, never blocks the UI
  (async () => {
    try {
      if (data.length > 0) {
        const rowsToUpsert = data.map(item => {
          let r = toDbRow(key, item);
          if (type === 'filtered') r = { ...r, ...filter };
          return r;
        });

        // Use upsert instead of delete+insert — merges on id conflict,
        // avoids RLS delete permission issues and race conditions
        const { error } = await supabase
          .from(table)
          .upsert(rowsToUpsert, { onConflict: 'id', ignoreDuplicates: false });

        if (error) {
          console.warn(`[storage.js] Supabase sync skipped for "${key}": ${error.message || '(see error object)'}`, error);
          // Not a critical error — data is safely stored in localStorage
        }
      }
    } catch (err) {
      console.warn(`[storage.js] Supabase sync exception for "${key}":`, err);
    }
  })();
}

// Sync from Supabase to local storage
export async function syncKeyFromCloud(key, fallback = []) {
  if (!supabase) {
    return asArray(safeParseJson(localStorage.getItem(key), fallback), fallback);
  }

  // Check backoff before attempting
  if (!connectionHealth.canTry()) {
    // Silently skip — we're still backing off after previous failures
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
        // Success — reset health tracker
        connectionHealth.ok();
        const cloudData = rows.map(r => fromDbRow(key, r));
        const localRaw = localStorage.getItem(key);
        if (localRaw !== JSON.stringify(cloudData)) {
          localStorage.setItem(key, JSON.stringify(cloudData));
          window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: cloudData } }));
        }
        return cloudData;
      } else if (error) {
        // Transient network/db error — don't spam the console
        connectionHealth.fail();
        if (connectionHealth.failures <= 3) {
          console.warn(`[storage.js] syncKeyFromCloud failed for "${key}" (attempt ${connectionHealth.failures}):`, error.message || error);
        } else if (connectionHealth.failures === 4) {
          console.warn(`[storage.js] syncKeyFromCloud: Supabase unreachable after ${connectionHealth.failures} attempts. Suppressing further logs until connection recovers.`);
        }
      }
    }
  } catch (err) {
    connectionHealth.fail();
    if (connectionHealth.failures <= 3) {
      console.warn(`[storage.js] syncKeyFromCloud connection error for "${key}" (attempt ${connectionHealth.failures}):`, err.message || err);
    } else if (connectionHealth.failures === 4) {
      console.warn(`[storage.js] syncKeyFromCloud: Connection lost. Suppressing further logs.`);
    }
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

// ── Connection Health Tracker with Adaptive Backoff ──
const connectionHealth = {
  failures: 0,
  lastFailureAt: 0,
  maxBackoffMs: 120_000,       // 2 min cap
  initialBackoffMs: 2_000,      // 2s start

  // Whether enough time has elapsed since last failure to try again
  canTry() {
    if (this.failures === 0) return true;
    const elapsed = Date.now() - this.lastFailureAt;
    const backoff = Math.min(
      this.initialBackoffMs * Math.pow(2, this.failures - 1),
      this.maxBackoffMs
    );
    return elapsed >= backoff;
  },

  fail() {
    this.failures++;
    this.lastFailureAt = Date.now();
  },

  ok() {
    this.failures = 0;
  },

  // Reset after prolonged success — drop the accumulated failure count
  reset() {
    this.failures = 0;
  }
};

// Start continuous sync loop
let syncInterval = null;
export function startDbSync(keys = []) {
  if (syncInterval) clearInterval(syncInterval);

  const performSync = () => {
    // Skip the poll if the health tracker says we're still backing off
    if (!connectionHealth.canTry()) return;

    keys.forEach(async (key) => {
      const result = await syncKeyFromCloud(key);
      if (result === null) {
        // syncKeyFromCloud already handles its own logging
      }
    });
  };

  // Initial sync (best-effort, won't block startup)
  performSync();

  // Listen to live database changes for instant sync
  let dbChannel = null;
  if (supabase) {
    dbChannel = supabase
      .channel('db-sync-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        // Realtime event → immediate sync (skip backoff for realtime events)
        keys.forEach(key => { syncKeyFromCloud(key); });
      })
      .subscribe();
  }

  // Poll every 30 seconds as a robust fallback (reduced from 5s to avoid HTTP/2 connection churn)
  syncInterval = setInterval(performSync, 30_000);
  
  return () => {
    clearInterval(syncInterval);
    if (dbChannel && supabase) {
      supabase.removeChannel(dbChannel);
    }
  };
}
