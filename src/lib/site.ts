/**
 * Canonical public origin of the site (no trailing slash).
 * Set NEXT_PUBLIC_APP_URL at build time to override, e.g. for staging.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pizza-demo.novixa.dev").replace(/\/+$/, "");

export const SITE_HOST = new URL(SITE_URL).host;
