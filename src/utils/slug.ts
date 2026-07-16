/**
 * Convert an arbitrary string into a URL-safe slug.
 * "React 19 & AI Tools!" -> "react-19-ai-tools"
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to a dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
