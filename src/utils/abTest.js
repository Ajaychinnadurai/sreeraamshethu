/**
 * A/B Testing Utility
 * Assigns users to variants, tracks clicks, and reports results.
 * Supports both PostHog (primary) and localStorage (fallback) persistence.
 * All data persisted in localStorage for cross-session tracking.
 */

import { getFeatureFlag, trackEvent, isPostHogReady, EXPERIMENT_FLAGS } from './posthog';

const STORAGE_PREFIX = 'sreeraam_abtest_';

/**
 * Get or assign a variant for a test.
 * Checks PostHog feature flags first (professional A/B), falls back to localStorage.
 * @param {string} testName - Unique test identifier (e.g. 'hero_cta_text')
 * @param {string[]} variants - Array of variant strings (e.g. ['A', 'B'])
 * @param {number[]} [weights] - Optional distribution weights (must sum to 1, default: equal)
 * @returns {{ variant: string, isNew: boolean }} The assigned variant and whether it's a new assignment
 */
export function getVariant(testName, variants = ['A', 'B'], weights = null) {
  // 1. Try PostHog feature flag first (professional A/B testing)
  if (isPostHogReady()) {
    const posthogFlagKey = EXPERIMENT_FLAGS[testName];

    if (posthogFlagKey) {
      const phVariant = getFeatureFlag(posthogFlagKey);
      if (phVariant && variants.includes(phVariant)) {
        // Also mirror to localStorage so our helper functions work
        localStorage.setItem(`${STORAGE_PREFIX}${testName}_variant`, phVariant);
        return { variant: phVariant, isNew: false };
      }
    }
  }

  // 2. Fall back to localStorage-based assignment
  const storageKey = `${STORAGE_PREFIX}${testName}_variant`;
  const existing = localStorage.getItem(storageKey);

  if (existing && variants.includes(existing)) {
    return { variant: existing, isNew: false };
  }

  // Assign variant based on weights or equal distribution
  let variant;
  if (weights && weights.length === variants.length) {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) {
        variant = variants[i];
        break;
      }
    }
    if (!variant) variant = variants[variants.length - 1];
  } else {
    variant = variants[Math.floor(Math.random() * variants.length)];
  }

  localStorage.setItem(storageKey, variant);

  // Initialize click count for this variant if not exists
  const clicksKey = `${STORAGE_PREFIX}${testName}_clicks`;
  const clicks = getClicks(testName);
  if (!clicks[variant]) {
    clicks[variant] = 0;
    localStorage.setItem(clicksKey, JSON.stringify(clicks));
  }

  return { variant, isNew: true };
}

/**
 * Track a click event for a test variant.
 * Sends to PostHog AND localStorage for dual persistence.
 * @param {string} testName - Unique test identifier
 * @param {string} variant - The variant that was clicked
 * @param {object} [metadata] - Optional additional data (timestamp, page, etc.)
 */
export function trackClick(testName, variant, metadata = {}) {
  const eventName = `ab_test_click_${testName}`;

  // Track in PostHog (professional analytics)
  trackEvent(eventName, {
    test_name: testName,
    variant,
    ...metadata
  });

  // Also track in localStorage (backup)
  const clicksKey = `${STORAGE_PREFIX}${testName}_clicks`;
  const clicks = getClicks(testName);

  if (!clicks[variant]) {
    clicks[variant] = 0;
  }
  clicks[variant] += 1;

  localStorage.setItem(clicksKey, JSON.stringify(clicks));

  // Store detailed event log (last 100 events to avoid bloat)
  const eventsKey = `${STORAGE_PREFIX}${testName}_events`;
  const events = getEvents(testName);
  events.push({
    variant,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  // Keep only last 100 events
  if (events.length > 100) {
    events.splice(0, events.length - 100);
  }
  localStorage.setItem(eventsKey, JSON.stringify(events));
}

/**
 * Get click counts for a test.
 * @param {string} testName - Unique test identifier
 * @returns {object} Map of variant -> click count
 */
export function getClicks(testName) {
  const clicksKey = `${STORAGE_PREFIX}${testName}_clicks`;
  try {
    const raw = localStorage.getItem(clicksKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get detailed event log for a test.
 * @param {string} testName - Unique test identifier
 * @returns {Array} Array of click event objects
 */
export function getEvents(testName) {
  const eventsKey = `${STORAGE_PREFIX}${testName}_events`;
  try {
    const raw = localStorage.getItem(eventsKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get the current assignment for a test (without creating one).
 * @param {string} testName - Unique test identifier
 * @returns {string|null} The variant or null if not assigned
 */
export function getAssignedVariant(testName) {
  const storageKey = `${STORAGE_PREFIX}${testName}_variant`;
  return localStorage.getItem(storageKey);
}

/**
 * Reset a test's data (variant assignment, clicks, events).
 * @param {string} testName - Unique test identifier
 */
export function resetTest(testName) {
  localStorage.removeItem(`${STORAGE_PREFIX}${testName}_variant`);
  localStorage.removeItem(`${STORAGE_PREFIX}${testName}_clicks`);
  localStorage.removeItem(`${STORAGE_PREFIX}${testName}_events`);
}

/**
 * Get a formatted summary of all test results.
 * @param {string} testName - Unique test identifier
 * @returns {object} Summary with variant distribution, click counts, and rates
 */
export function getTestSummary(testName) {
  const variant = getAssignedVariant(testName);
  const clicks = getClicks(testName);
  const events = getEvents(testName);

  const totalClicks = Object.values(clicks).reduce((sum, count) => sum + count, 0);

  return {
    testName,
    yourVariant: variant || 'Not assigned',
    clicksPerVariant: clicks,
    totalClicks,
    recentEvents: events.slice(-10).reverse(),
    lastEvent: events.length > 0 ? events[events.length - 1] : null
  };
}

/**
 * Log A/B test results to browser console for quick debugging.
 * Includes PostHog status info.
 * @param {string} testName - Unique test identifier
 */
export function logResults(testName) {
  const summary = getTestSummary(testName);
  console.log(`%c📊 A/B Test: ${testName}`, 'font-size: 16px; font-weight: bold;');
  console.log(`  Your variant: ${summary.yourVariant}`);
  console.log(`  Clicks per variant:`, summary.clicksPerVariant);
  console.log(`  Total clicks: ${summary.totalClicks}`);
  console.log(`  PostHog: ${isPostHogReady() ? '✅ Active' : '❌ Not configured (using localStorage)'}`);
  if (summary.recentEvents.length > 0) {
    console.log(`  Recent events:`, summary.recentEvents);
  }
  return summary;
}

/**
 * A/B test configurations
 */
export const HERO_CTA_TEST = {
  name: 'hero_cta_text',
  variants: [
    { id: 'A', label: 'REQUEST A QUOTE' },
    { id: 'B', label: 'GET STARTED' }
  ]
};

export const LAYOUT_TEST = {
  name: 'landing_layout',
  variants: [
    { id: 'A', label: 'Classic Layout' },
    { id: 'B', label: 'Conversion Layout' }
  ]
};

/**
 * Read variant from URL search params (?variant=a or ?variant=b),
 * persist to localStorage, and return the resolved variant.
 * URL param takes priority over localStorage.
 */
export function resolveVariantFromUrl(testName, variants = ['A', 'B']) {
  const params = new URLSearchParams(window.location.search);
  const urlVariant = params.get('variant');
  const urlMatch = urlVariant && variants.includes(urlVariant.toUpperCase())
    ? urlVariant.toUpperCase()
    : null;

  if (urlMatch) {
    // URL param wins — persist it
    localStorage.setItem(`${STORAGE_PREFIX}${testName}_variant`, urlMatch);
    return { variant: urlMatch, source: 'url' };
  }

  // Fall back to stored or random assignment
  const { variant, isNew } = getVariant(testName, variants);
  return { variant, source: isNew ? 'random' : 'stored' };
}

/**
 * Register keyboard shortcut listener (Ctrl+Shift+D) to dump ALL A/B test results.
 * Call this once in App.jsx or any root component.
 */
export function registerAbTestDebugShortcut() {
  const handler = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      const allTests = [HERO_CTA_TEST.name, LAYOUT_TEST.name];
      let msg = '📊 A/B Test Results\n\n';
      allTests.forEach(name => {
        const s = getTestSummary(name);
        msg += `── ${name} ──\n`;
        msg += `Your variant: ${s.yourVariant}\n`;
        msg += `Clicks: ${JSON.stringify(s.clicksPerVariant)}\n`;
        msg += `Total clicks: ${s.totalClicks}\n`;
        msg += `PostHog: ${isPostHogReady() ? '✅' : '❌'}\n\n`;
        logResults(name);
      });
      alert(msg);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
