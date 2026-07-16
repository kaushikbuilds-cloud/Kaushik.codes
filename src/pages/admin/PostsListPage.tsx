import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  FilePlus2,
  Link2,
  Pencil,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { useAdminPosts, useDeletePost, useSetPostStatus } from '@/features/posts/usePosts';
import { StatusPill } from '@/components/admin/StatusPill';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/date';
import { getErrorMessage } from '@/utils/error';
import { useSeo } from '@/hooks/useSeo';
import { cn } from '@/utils/cn';
import type { PostListItem, PostStatus } from '@/types/database';

type Filter = 'all' | PostStatus;

export function PostsListPage() {
  const { data: posts, isLoading } = useAdminPosts();
  const deletePost = useDeletePost();
  const setStatus = useSetPostStatus();
  const { toast } = useToast();
  useSeo({ title: 'Posts — Kaushik Codes Admin', noindex: true });

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<PostListItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts ?? []).filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [posts, query, filter]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePost.mutateAsync(toDelete.id);
      toast('Post deleted', 'info');
      setToDelete(null);
    } catch (err) {
      toast(getErrorMessage(err, 'Delete failed'), 'error');
    }
  };

  const togglePublish = async (post: PostListItem) => {
    const next: PostStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await setStatus.mutateAsync({ id: post.id, status: next });
      toast(next === 'published' ? 'Post published 🚀' : 'Moved to draft', 'info');
    } catch (err) {
      toast(getErrorMessage(err, 'Update failed'), 'error');
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Posts</h1>
          <p className="text-sm text-muted">Manage all your posts</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary">
          <FilePlus2 size={16} />
          <span className="hidden sm:inline">New Post</span>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'draft'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'border-accent bg-accent/15 text-white'
                  : 'border-border bg-bg-soft text-muted hover:text-white',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="card divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FilePlus2 size={40} />}
          title={query || filter !== 'all' ? 'No matching posts' : 'No posts yet'}
          description={
            query || filter !== 'all'
              ? 'Try a different search or filter.'
              : 'Create your first post to get started.'
          }
          action={
            <Link to="/admin/posts/new" className="btn-primary">
              New Post
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-border">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{post.title}</p>
                  <StatusPill status={post.status} />
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <Link2 size={12} />
                  {post.resource_count} links · {post.category?.name ?? 'Uncategorised'} ·{' '}
                  {formatDate(post.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {post.status === 'published' && (
                  <a
                    href={`/links/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted hover:bg-bg-elevated hover:text-white"
                    title="View live"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => togglePublish(post)}
                  className="rounded-lg p-2 text-muted hover:bg-bg-elevated hover:text-white"
                  title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  <Send size={16} />
                </button>
                <Link
                  to={`/admin/posts/${post.id}`}
                  className="rounded-lg p-2 text-muted hover:bg-bg-elevated hover:text-white"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(post)}
                  className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this post?"
        description={
          <>
            <span className="font-medium text-white">{toDelete?.title}</span> and its{' '}
            {toDelete?.resource_count} links will be permanently deleted. This cannot be undone.
          </>
        }
        loading={deletePost.isPending}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
