/** URL helpers for validation and display. */

/** Validate that a string is a well-formed http(s) URL. */
export function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalise a URL by adding https:// if no protocol is present. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Extract a display hostname from a URL, e.g. "https://openai.com/x" -> "openai.com". */
export function displayHost(value: string): string {
  try {
    return new URL(normalizeUrl(value)).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

/** Build a Google favicon URL for a given site (used as a fallback icon). */
export function faviconFor(value: string, size = 64): string {
  const host = displayHost(value);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
