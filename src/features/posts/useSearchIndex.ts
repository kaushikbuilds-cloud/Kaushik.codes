import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchIndex, type SearchablePost } from '@/services/posts';

/** Fetch the published-post search index (also powers the Latest grid). */
export function useSearchIndex() {
  return useQuery({
    queryKey: ['posts', 'search-index'],
    queryFn: fetchSearchIndex,
  });
}

/**
 * Filter posts by a free-text query and an optional category slug.
 * Matches against title, descriptions, category, tags and resource names.
 */
export function useFilteredPosts(
  posts: SearchablePost[] | undefined,
  query: string,
  categorySlug: string | null,
): SearchablePost[] {
  return useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    return posts.filter((post) => {
      if (categorySlug && post.category?.slug !== categorySlug) return false;
      if (terms.length === 0) return true;
      // Every term must appear somewhere in the search blob.
      return terms.every((term) => post.search_blob.includes(term));
    });
  }, [posts, query, categorySlug]);
}
