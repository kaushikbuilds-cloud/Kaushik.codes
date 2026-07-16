import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Tuned for a read-heavy public site:
 * generous stale times to minimise refetching on mobile data.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Centralised query keys to avoid typos and enable targeted invalidation. */
export const queryKeys = {
  settings: ['settings'] as const,
  categories: ['categories'] as const,
  posts: (filters?: Record<string, unknown>) =>
    filters ? (['posts', filters] as const) : (['posts'] as const),
  post: (slug: string) => ['post', slug] as const,
  adminPosts: ['admin', 'posts'] as const,
  adminPost: (id: string) => ['admin', 'post', id] as const,
  adminStats: ['admin', 'stats'] as const,
  analytics: (range: string) => ['admin', 'analytics', range] as const,
  tags: ['tags'] as const,
};
