/**
 * Tiny className combiner — joins truthy class strings with a space.
 * Avoids pulling in a dependency for such a small need.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
