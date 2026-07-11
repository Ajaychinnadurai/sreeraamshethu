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
