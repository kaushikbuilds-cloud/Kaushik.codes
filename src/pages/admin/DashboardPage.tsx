import { Link } from 'react-router-dom';
import {
  Eye,
  FileText,
  FilePlus2,
  Link2,
  MousePointerClick,
  PencilLine,
  Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDashboardStats } from '@/features/analytics/useAnalytics';
import { useAdminPosts } from '@/features/posts/usePosts';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/admin/StatusPill';
import { formatDate } from '@/utils/date';
import { useSeo } from '@/hooks/useSeo';

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: posts } = useAdminPosts();
  useSeo({ title: 'Dashboard — Kaushik Codes Admin', noindex: true });

  const recent = (posts ?? []).slice(0, 6);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-muted">Overview of your link hub</p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary">
          <FilePlus2 size={16} />
          <span className="hidden sm:inline">New Post</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={FileText} label="Total Posts" value={stats?.totalPosts} loading={isLoading} />
        <StatCard icon={Send} label="Published" value={stats?.publishedPosts} loading={isLoading} />
        <StatCard icon={PencilLine} label="Drafts" value={stats?.draftPosts} loading={isLoading} />
        <StatCard icon={Link2} label="Resources" value={stats?.totalResources} loading={isLoading} />
        <StatCard icon={MousePointerClick} label="Clicks" value={stats?.totalClicks} loading={isLoading} />
        <StatCard icon={Eye} label="Views" value={stats?.totalViews} loading={isLoading} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Posts</h2>
          <Link to="/admin/posts" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">
            No posts yet.{' '}
            <Link to="/admin/posts/new" className="text-accent hover:underline">
              Create your first post
            </Link>
            .
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {recent.map((post) => (
              <Link
                key={post.id}
                to={`/admin/posts/${post.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-elevated"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{post.title}</p>
                  <p className="text-xs text-muted">
                    {post.resource_count} links · {formatDate(post.created_at)}
                  </p>
                </div>
                <StatusPill status={post.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="card p-4">
      <span className="text-accent">
        <Icon size={18} />
      </span>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p className="mt-2 text-2xl font-bold text-white">{value ?? 0}</p>
      )}
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
