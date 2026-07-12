import { useEffect } from 'react';

/**
 * SEO — Lightweight meta-tag updater for SPA pages.
 * Updates document.title, meta description, OG tags, and Twitter cards.
 * No external dependencies needed (no react-helmet).
 *
 * Usage:
 *   <SEO
 *     title="About Us | Shree Ramsethu Constructions"
 *     description="Learn about our team..."
 *     canonical="https://shreeramsethu.com/about"
 *     image="/og-default.jpg"
 *   />
 */
export default function SEO({
  title,
  description,
  canonical,
  image = '/og-default.jpg',
  type = 'website',
  locale = 'en_IN',
  noindex = false
}) {
  const siteName = 'Shree Ramsethu Constructions & Interiors';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const baseUrl = 'https://shreeramsethu.vercel.app';
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  useEffect(() => {
    // ── Title ──
    document.title = fullTitle;

    // ── Helper to find or create a meta tag ──
    const setMeta = (property, content, attr = 'name') => {
      if (!content) return;
      const escaped = property.replace(/[:\s]/g, '\\:');
      let el = document.querySelector(`meta[${attr}="${escaped}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── Robots / Noindex ──
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // ── Standard meta ──
    setMeta('description', description);
    setMeta('keywords', 'construction company Rameswaram, civil engineer Tamil Nadu, house builder Pamban, lodge construction, interior decoration, structural engineering, Sree Raam Shethu');

    // ── Open Graph ──
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description);
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', image.startsWith('http') ? image : `${baseUrl}${image}`, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:locale', locale, 'property');
    setMeta('og:site_name', siteName, 'property');

    // ── Twitter Card ──
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image.startsWith('http') ? image : `${baseUrl}${image}`);

    // ── Canonical ──
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Cleanup is intentionally omitted for SPA — tags persist across navigations
    // and get overwritten by the next page's SEO component
  }, [fullTitle, description, canonicalUrl, image, type, locale, siteName, baseUrl]);

  // This component renders nothing
  return null;
}
