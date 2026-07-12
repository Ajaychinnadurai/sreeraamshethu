// ── Persistent Sync Retry Queue ──
// Tracks failed Supabase write operations and retries them when back online.
// Persists across page reloads via localStorage.

const QUEUE_KEY = 'sreeraam_sync_retry_queue';
const MAX_RETRIES = 5;

// ── Retry Queue Item ──
// {
//   id: string (unique),
//   key: string (localStorage key),
//   data: any (the full data array to sync),
//   timestamp: number (when the failure occurred),
//   error: string (error message for display),
//   retryCount: number (how many times we've tried),
//   lastRetryAt: number | null
// }

// ── Online/Offline Detection ──
let _online = typeof navigator !== 'undefined' ? navigator.onLine : true;
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach(fn => fn(_online));
}

export function isOnline() {
  return _online;
}

export function onOnlineStatusChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// Initialize online/offline listeners (runs once at module import)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    _online = true;
    notifyListeners();
    // Auto-retry all pending when coming back online
    retryAll();
  });
  window.addEventListener('offline', () => {
    _online = false;
    notifyListeners();
  });
}

// ── Queue Operations ──

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent('sreeraam_sync_queue_update', { detail: queue }));
}

export function getPendingItems() {
  return readQueue();
}

export function getPendingCount() {
  return readQueue().length;
}

export function enqueueRetry(key, data, errorMsg) {
  const queue = readQueue();
  // Avoid duplicate entries for the same key (update existing instead)
  const existing = queue.find(item => item.key === key);
  if (existing) {
    existing.data = data;
    existing.timestamp = Date.now();
    existing.error = errorMsg || 'Sync failed';
    existing.retryCount = 0;
    existing.lastRetryAt = null;
  } else {
    queue.push({
      id: `retry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      key,
      data,
      timestamp: Date.now(),
      error: errorMsg || 'Sync failed',
      retryCount: 0,
      lastRetryAt: null
    });
  }
  writeQueue(queue);
}

export function dequeueItem(id) {
  const queue = readQueue();
  const updated = queue.filter(item => item.id !== id);
  writeQueue(updated);
}

export async function retryAll() {
  const queue = readQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  const { saveLocalAndCloud } = await import('./storage');
  let success = 0;
  let failed = 0;
  const remaining = [];

  for (const item of queue) {
    if (item.retryCount >= MAX_RETRIES) {
      remaining.push(item); // Exhausted retries — keep in queue but don't retry
      failed++;
      continue;
    }

    // Optimistically remove from queue first. If sync succeeds,
    // saveLocalAndCloud's success handler won't re-add it.
    // If sync fails, saveLocalAndCloud's internal enqueueRetry will re-add it.
    item.retryCount++;
    item.lastRetryAt = Date.now();

    try {
      await saveLocalAndCloud(item.key, item.data);
      // Sync succeeded — saveLocalAndCloud already removed any pending retry
      success++;
    } catch (err) {
      // saveLocalAndCloud already re-enqueued this via internal enqueueRetry
      item.error = err.message || 'Retry failed';
      remaining.push(item);
      failed++;
    }
  }

  // Only write back items that exhausted retries or had failures
  // (successful items were already removed by saveLocalAndCloud's internal handler)
  writeQueue(remaining);
  return { success, failed };
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new CustomEvent('sreeraam_sync_queue_update', { detail: [] }));
}
