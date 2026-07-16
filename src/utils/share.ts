/**
 * Share helper: uses the Web Share API when available, otherwise copies the
 * URL to the clipboard. Returns how the share resolved so the UI can show the
 * right toast.
 */
export type ShareResult = 'shared' | 'copied' | 'error';

export async function shareOrCopy(data: {
  title: string;
  text?: string;
  url: string;
}): Promise<ShareResult> {
  // Prefer the native share sheet (great inside Instagram's browser on mobile).
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      // AbortError means the user cancelled — don't fall through to copy.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'error';
      }
      // Otherwise fall back to copy below.
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
    // Legacy fallback.
    const el = document.createElement('textarea');
    el.value = data.url;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return 'copied';
  } catch {
    return 'error';
  }
}
