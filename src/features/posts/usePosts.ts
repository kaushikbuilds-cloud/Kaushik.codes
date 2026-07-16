import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import {
  createPost,
  deletePost,
  fetchAllPosts,
  fetchPostById,
  fetchPostBySlug,
  fetchPublishedPosts,
  setPostStatus,
  updatePost,
  type PostInput,
} from '@/services/posts';
import type { PostStatus } from '@/types/database';

// ---- Public ---------------------------------------------------------------

export function usePublishedPosts(categorySlug?: string | null) {
  return useQuery({
    queryKey: queryKeys.posts({ category: categorySlug ?? 'all' }),
    queryFn: () => fetchPublishedPosts(categorySlug),
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.post(slug),
    queryFn: () => fetchPostBySlug(slug),
    enabled: Boolean(slug),
  });
}

// ---- Admin ----------------------------------------------------------------

export function useAdminPosts() {
  return useQuery({
    queryKey: queryKeys.adminPosts,
    queryFn: fetchAllPosts,
  });
}

export function useAdminPost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.adminPost(id ?? 'new'),
    queryFn: () => fetchPostById(id as string),
    enabled: Boolean(id),
  });
}

function invalidateAllPostQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.adminPosts });
  qc.invalidateQueries({ queryKey: ['posts'] });
  qc.invalidateQueries({ queryKey: queryKeys.adminStats });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => createPost(input),
    onSuccess: () => invalidateAllPostQueries(qc),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostInput }) =>
      updatePost(id, input),
    onSuccess: (_data, vars) => {
      invalidateAllPostQueries(qc);
      qc.invalidateQueries({ queryKey: queryKeys.adminPost(vars.id) });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => invalidateAllPostQueries(qc),
  });
}

export function useSetPostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostStatus }) =>
      setPostStatus(id, status),
    onSuccess: () => invalidateAllPostQueries(qc),
  });
}
