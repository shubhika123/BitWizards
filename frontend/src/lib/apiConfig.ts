const isBrowser = typeof window !== "undefined";

const isLocal = isBrowser
  ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  : process.env.NODE_ENV !== "production";

const defaultApiUrl = isLocal
  ? "http://localhost:8000"
  : "https://bitwizards.onrender.com";

// Browser talks to the published host URL; server-side (Docker) can use the internal service name.
export const API_BASE_URL = isBrowser
  ? process.env.NEXT_PUBLIC_API_URL || defaultApiUrl
  : process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;
