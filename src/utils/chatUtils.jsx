/**
 * Chat enhancement utilities — quick replies, smart suggestions, rich formatting
 */

// ─── Quick Reply Button Definitions ───
export const QUICK_REPLIES = {
  project_status: {
    label: '📋 Project Status',
    message: 'Can you update me on the current status of my project?',
    category: 'updates'
  },
  schedule_visit: {
    label: '🏗️ Site Visit',
    message: 'I would like to schedule a site visit. What times are available this week?',
    category: 'actions'
  },
  request_quote: {
    label: '💰 Request Quote',
    message: 'Please send me a quotation for my project requirements.',
    category: 'billing'
  },
  interior_design: {
    label: '🎨 Interior Design',
    message: 'I am interested in your interior decoration services. Can you share some portfolio examples?',
    category: 'services'
  },
  call_me: {
    label: '📞 Call Me Back',
    message: 'Please call me back at my registered number to discuss the project.',
    category: 'contact'
  },
  payment: {
    label: '💳 Payment Query',
    message: 'I have a question about the payment schedule and installment plan.',
    category: 'billing'
  },
  materials: {
    label: '🧱 Materials Info',
    message: 'Can you tell me about the construction materials and finishes used?',
    category: 'technical'
  },
  timeline: {
    label: '📅 Project Timeline',
    message: 'What is the estimated timeline for completion of my project?',
    category: 'updates'
  }
};

export const QUICK_REPLY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'updates', label: 'Updates' },
  { id: 'actions', label: 'Actions' },
  { id: 'billing', label: 'Billing' },
  { id: 'services', label: 'Services' },
  { id: 'technical', label: 'Technical' }
];

// ─── Smart Suggestion Logic ───
const SUGGESTION_KEYWORDS = [
  { keywords: ['status', 'progress', 'update', 'how is', 'where is'], replyKey: 'project_status' },
  { keywords: ['visit', 'site', 'come', 'see', 'inspect', 'walkthrough'], replyKey: 'schedule_visit' },
  { keywords: ['quote', 'price', 'cost', 'estimate', 'how much', 'quotation', 'rate'], replyKey: 'request_quote' },
  { keywords: ['interior', 'design', 'decoration', 'decor', 'furniture', 'style'], replyKey: 'interior_design' },
  { keywords: ['call', 'phone', 'contact', 'reach', 'talk'], replyKey: 'call_me' },
  { keywords: ['payment', 'pay', 'installment', 'emi', 'budget', 'cost'], replyKey: 'payment' },
  { keywords: ['material', 'wood', 'concrete', 'steel', 'quality', 'finish', 'tile', 'marble'], replyKey: 'materials' },
  { keywords: ['timeline', 'schedule', 'deadline', 'when', 'finish', 'complete', 'ready'], replyKey: 'timeline' }
];

/**
 * Detect smart suggestions based on the last message text.
 * Returns array of quick reply keys that match the message content.
 */
export function detectSmartSuggestions(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const matched = new Set();

  for (const rule of SUGGESTION_KEYWORDS) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matched.add(rule.replyKey);
        break;
      }
    }
  }

  // Return up to 3 suggestions, maintaining the order they appear in QUICK_REPLIES
  const allKeys = Object.keys(QUICK_REPLIES);
  return allKeys.filter(k => matched.has(k)).slice(0, 3);
}

// ─── Rich Message Formatting ───

/**
 * Parse a message text and return React-compatible rendered parts.
 * Supports:
 *   **bold text** → <strong>
 *   https://...   → clickable link
 *   \n            → <br />
 */
export function formatMessageText(text) {
  if (!text) return text;

  const parts = [];
  let remaining = text;

  // Match bold patterns **text**
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(remaining)) !== null) {
    // Text before bold
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    parts.push({ type: 'bold', text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last bold
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  } else if (lastIndex === 0) {
    // No bold matches at all
    parts.push(text);
  }

  // Now process each string part for links
  const processed = parts.map(part => {
    if (typeof part === 'string') {
      return processLinks(part);
    }
    return part;
  });

  return processed.flat();
}

function processLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const segments = [];
  let last = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push(text.slice(last, match.index));
    }
    segments.push({ type: 'link', url: match[0], text: match[0].length > 50 ? match[0].slice(0, 47) + '...' : match[0] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    segments.push(text.slice(last));
  }

  return segments.length > 0 ? segments : [text];
}

/**
 * Render formatted message parts as React elements.
 */
export function renderFormattedParts(parts, options = {}) {
  if (typeof parts === 'string') {
    return parts.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {line}
      </span>
    ));
  }

  if (!Array.isArray(parts)) return parts;

  return parts.map((part, i) => {
    if (typeof part === 'string') {
      return part.split('\n').map((line, li) => (
        <span key={`${i}-${li}`}>
          {li > 0 && <br />}
          {line}
        </span>
      ));
    }
    if (part.type === 'bold') {
      return <strong key={i} style={{ fontWeight: '700' }}>{part.text}</strong>;
    }
    if (part.type === 'link') {
      return (
        <a key={i} href={part.url} target="_blank" rel="noreferrer"
          style={{
            color: options.linkColor || 'inherit',
            textDecoration: 'underline',
            opacity: 0.9,
            wordBreak: 'break-all'
          }}
        >
          {part.text || part.url}
        </a>
      );
    }
    return part;
  });
}

// ─── File/Attachment Handling ───

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_FILE_TYPES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';

/**
 * Read a file as base64 data URL.
 * Returns a promise with { dataUrl, name, size, type }
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 5 MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/')
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get a human-readable file size string.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file icon emoji based on type.
 */
export function getFileEmoji(type) {
  if (!type) return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return '📊';
  if (type.includes('text') || type.includes('txt')) return '📃';
  return '📄';
}
