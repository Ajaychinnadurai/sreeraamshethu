/**
 * PostHog Analytics & A/B Testing Integration
 *
 * Provides PostHog initialization, feature flag experiments, and event tracking.
 * Falls back gracefully to localStorage-based tracking if PostHog is not configured.
 */

import posthog from 'posthog-js';

// PostHog project API key — set VITE_POSTHOG_KEY in .env or Vercel env vars
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

/**
 * Initialize PostHog. Call once at app startup.
 * Safe to call multiple times — only initializes on first call.
 */
export function initPostHog() {
  if (isInitialized || !POSTHOG_KEY) {
    if (!POSTHOG_KEY) {
      console.log('[PostHog] No VITE_POSTHOG_KEY found — running in localStorage-only A/B test mode.');
    }
    return isInitialized;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,          // Auto-track page views
      capture_pageleave: true,         // Track when users leave
      persistence: 'localStorage',     // Store identity in localStorage
      loaded: () => {
        isInitialized = true;
        console.log('[PostHog] Initialized successfully.');
      }
    });
  } catch (err) {
    console.warn('[PostHog] Initialization failed:', err);
  }

  return isInitialized;
}

/**
 * Check if PostHog is actively running.
 */
export function isPostHogReady() {
  return isInitialized && POSTHOG_KEY && typeof posthog.capture === 'function';
}

/**
 * Get a feature flag / experiment variant value.
 * Returns localStorage fallback if PostHog is not ready.
 *
 * @param {string} flagKey - PostHog feature flag key (e.g. 'hero-cta-text')
 * @param {object} options - { defaultValue, localStorageKey, variants }
 * @returns {string|boolean} The flag value
 */
export function getFeatureFlag(flagKey, options = {}) {
  const { defaultValue = false, localStorageKey = null, variants = null } = options;

  // Try PostHog first
  if (isPostHogReady()) {
    try {
      const flagValue = posthog.getFeatureFlag(flagKey);
      if (flagValue !== undefined && flagValue !== null) {
        return flagValue;
      }
    } catch (err) {
      console.warn(`[PostHog] getFeatureFlag("${flagKey}") failed:`, err);
    }
  }

  // Fall back to localStorage
  if (localStorageKey) {
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored && variants && variants.includes(stored)) {
        return stored;
      }
    } catch {}
  }

  return defaultValue;
}

/**
 * Track a custom event in PostHog + localStorage simultaneously.
 *
 * @param {string} eventName - Event name (e.g. 'hero_cta_clicked')
 * @param {object} properties - Additional properties (variant, page, etc.)
 */
export function trackEvent(eventName, properties = {}) {
  // Track in PostHog
  if (isPostHogReady()) {
    try {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname
      });
    } catch (err) {
      console.warn(`[PostHog] trackEvent("${eventName}") failed:`, err);
    }
  }

  // Also track in our existing localStorage system for backup
  // This is handled by the abTest utility, so no need to duplicate
}

/**
 * Identify a user in PostHog (after signup/login).
 * @param {string} userId - Unique user identifier (email or ID)
 * @param {object} traits - User properties (name, role, etc.)
 */
export function identifyUser(userId, traits = {}) {
  if (isPostHogReady()) {
    try {
      posthog.identify(userId, traits);
    } catch (err) {
      console.warn('[PostHog] identify failed:', err);
    }
  }
}

/**
 * Reset user identity (on logout).
 */
export function resetUser() {
  if (isPostHogReady()) {
    try {
      posthog.reset();
    } catch (err) {
      console.warn('[PostHog] reset failed:', err);
    }
  }
}

/**
 * Get a formatted summary of feature flags for debugging.
 */
export function getPostHogFlags() {
  if (!isPostHogReady()) return { status: 'PostHog not initialized' };

  try {
    const flags = posthog.getFeatureFlags();
    const flagPayloads = posthog.getFeatureFlagPayloads();
    return { flags, flagPayloads };
  } catch {
    return { status: 'Could not retrieve flags' };
  }
}

/**
 * PostHog experiment / feature flag key definitions.
 * Create these flags in your PostHog dashboard under Experiments.
 */
export const EXPERIMENTS = {
  HERO_CTA_TEXT: {
    flagKey: 'hero-cta-text',
    variants: ['control', 'test'],
    localStorageKey: 'sreeraam_abtest_hero_cta_text_variant',
    defaultValue: 'A'
  },
  LANDING_LAYOUT: {
    flagKey: 'landing-layout',
    variants: ['A', 'B'],
    localStorageKey: 'sreeraam_abtest_landing_layout_variant',
    defaultValue: 'A'
  }
};
