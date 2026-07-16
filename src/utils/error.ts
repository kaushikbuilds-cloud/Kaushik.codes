/**
 * Extract a human-readable message from any thrown value.
 *
 * Supabase client errors (PostgrestError, AuthError, StorageError) are plain
 * objects shaped like an Error — not actual `Error` instances — so
 * `err instanceof Error` misses them and falls back to a generic message,
 * hiding the real database/auth/storage error from the user.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
