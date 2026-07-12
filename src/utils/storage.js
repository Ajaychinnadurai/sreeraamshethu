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

const BUCKET_URL = 'https://kvdb.io/J6e3PPhwXzgPjqkPLRTxnk';

// Write locally, then push to cloud in background
export function saveLocalAndCloud(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  
  // Notify local components immediately
  window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data } }));

  // Push to cloud asynchronously
  fetch(`${BUCKET_URL}/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.warn(`Cloud push failed for ${key}:`, err));
}

// Background sync from cloud to local
export async function syncKeyFromCloud(key, fallback = []) {
  try {
    const res = await fetch(`${BUCKET_URL}/${key}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim()) {
        const parsed = JSON.parse(text);
        const cloudData = Array.isArray(parsed) ? parsed : fallback;
        
        // Compare with local before updating to prevent redundant state re-renders
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

    // 1. Fetch from cloud first to see if it exists
    const res = await fetch(`${BUCKET_URL}/${key}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim()) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          // Cloud has data! Write to local storage if local is different
          if (localRaw !== JSON.stringify(parsed)) {
            localStorage.setItem(key, JSON.stringify(parsed));
            window.dispatchEvent(new CustomEvent('sreeraam_db_update', { detail: { key, data: parsed } }));
          }
          return;
        }
      }
    }

    // 2. Cloud has NO data (404 or empty)
    if (localRaw) {
      // Local has data. Replicate local data to the cloud so they are synchronized!
      const parsed = JSON.parse(localRaw);
      // Double check registeredUsers seeded defaults locally
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

    // 3. Both local and cloud are empty. Seed defaults!
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
