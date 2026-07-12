/**
 * Chat Workflow Data Integrity Test
 * Run: node test_chat_workflow.mjs
 */

const { safeParseJson, asArray } = await import('./src/utils/storage.js');

// Simulate localStorage
global.localStorage = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();

global.window = {
  dispatchEvent: () => {},
  location: { href: '', search: '', pathname: '/' },
  history: { replaceState: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = function(type, detail) { return { type, detail }; };
global.setTimeout = setTimeout;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else { failed++; console.log(`  ❌ ${message}`); }
}

console.log('\n🚀 Chat Workflow Data Integrity Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Step 1: Test data structures
console.log('\n📝 Step 1: Message data structures');
const clientMsg = { id: Date.now(), sender: 'client', clientEmail: 'test@test.com', clientName: 'Test User', text: 'Hello', time: 'Just now' };
const notif = { id: Math.floor(Date.now() + Math.random()), iconName: 'message', title: 'Test', message: 'Test msg', time: '10:00', date: 'Just now', read: false };
assert(Number.isInteger(clientMsg.id), 'Client message id is integer');
assert(Number.isInteger(notif.id), 'Notification id is integer after Math.floor');
assert(clientMsg.sender === 'client', 'Sender is client');
assert(notif.read === false, 'Notification read defaults to false');

// Step 2: Storage round-trip
console.log('\n📝 Step 2: localStorage round-trip');
localStorage.setItem('sreeraam_chat_messages', JSON.stringify([clientMsg]));
const read = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
assert(Array.isArray(read), 'Stored messages is an array');
assert(read.length === 1, '1 message stored');
assert(read[0].text === 'Hello', 'Message text preserved');

// Step 3: Filter by client email
console.log('\n📝 Step 3: Thread filtering');
const all = safeParseJson(localStorage.getItem('sreeraam_chat_messages'), []);
const filtered = all.filter(m => m.clientEmail === 'test@test.com');
assert(filtered.length === 1, 'Filter by email returns 1 message');

// Step 4: Unread counts
console.log('\n📝 Step 4: Unread message counts');
const clientUnread = all.filter(m => m.sender === 'admin' && !m.read);
assert(clientUnread.length === 0, 'No unread admin messages yet');
const adminUnread = all.filter(m => m.sender === 'client' && !m.read);
assert(adminUnread.length === 1, 'Admin has 1 unread client message');

// Step 5: Auto-reply
console.log('\n📝 Step 5: Auto-reply data');
const reply = { id: Date.now(), sender: 'admin', clientEmail: 'test@test.com', clientName: 'Test User', text: 'Thank you!', time: 'Just now', read: false };
assert(Number.isInteger(reply.id), 'Reply id is integer');
assert(reply.sender === 'admin', 'Reply sender is admin');
all.push(reply);
assert(all.length === 2, '2 messages after reply');

// Step 6: Admin notification
console.log('\n📝 Step 6: Admin notification');
const adminNotif = { id: Math.floor(Date.now() + Math.random()), iconName: 'message', title: 'New Msg', message: 'Test', time: '10:00', date: 'Just now', read: false };
assert(Number.isInteger(adminNotif.id), 'Admin notif id is integer');
localStorage.setItem('sreeraam_notifications_admin', JSON.stringify([adminNotif]));
const readNotifs = safeParseJson(localStorage.getItem('sreeraam_notifications_admin'), []);
assert(readNotifs.length === 1, '1 admin notification stored');

// Step 7: Client notification
console.log('\n📝 Step 7: Client notification');
const clientNotif = { id: Math.floor(Date.now() + Math.random()), iconName: 'bell', title: 'Reply', message: 'Admin replied', time: '10:00', read: false };
assert(Number.isInteger(clientNotif.id), 'Client notif id is integer');
const key = 'sreeraam_notifications_client_test@test.com';
localStorage.setItem(key, JSON.stringify([clientNotif]));
const readClientNotifs = safeParseJson(localStorage.getItem(key), []);
assert(readClientNotifs.length === 1, '1 client notification stored');
assert(readClientNotifs[0].iconName === 'bell', 'Client notification icon is bell');

// Step 8: Mark as read
console.log('\n📝 Step 8: Mark messages as read');
const updated = all.map(m => (m.clientEmail === 'test@test.com' && m.sender === 'client') ? { ...m, read: true } : m);
const stillUnread = updated.filter(m => m.sender === 'client' && !m.read);
assert(stillUnread.length === 0, 'Client messages marked as read after admin views thread');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 ${passed}/${passed + failed} tests passed`);
if (failed > 0) process.exit(1);
