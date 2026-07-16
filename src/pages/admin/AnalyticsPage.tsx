import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, Eye, MousePointerClick } from 'lucide-react';
import { useAnalytics } from '@/features/analytics/useAnalytics';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { timeAgo } from '@/utils/date';
import { useSeo } from '@/hooks/useSeo';
import { cn } from '@/utils/cn';
import type { DailyCount } from '@/services/analytics';

const RANGES = [7, 30, 90] as const;

export function AnalyticsPage() {
  const [range, setRange] = useState<number>(30);
  const { data, isLoading } = useAnalytics(range);
  useSeo({ title: 'Analytics — Kaushik Codes Admin', noindex: true });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-muted">Anonymous — no IPs, no personal data</p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                range === r
                  ? 'border-accent bg-accent/15 text-white'
                  : 'border-border bg-bg-soft text-muted hover:text-white',
              )}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Clicks by date */}
      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-accent" />
          <h2 className="text-sm font-bold text-white">Clicks by date</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ClicksChart data={data?.clicksByDate ?? []} />
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Most viewed posts */}
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Eye size={18} className="text-accent" />
            <h2 className="text-sm font-bold text-white">Most viewed posts</h2>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : (data?.mostViewedPosts.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No views yet.</p>
          ) : (
            <ul className="space-y-1">
              {data!.mostViewedPosts.map((p) => (
                <li key={p.post_id} className="flex items-center justify-between gap-3 py-1.5">
                  <Link
                    to={`/links/${p.slug}`}
                    target="_blank"
                    className="min-w-0 truncate text-sm text-white hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold text-muted">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Most clicked resources */}
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <MousePointerClick size={18} className="text-accent" />
            <h2 className="text-sm font-bold text-white">Most clicked resources</h2>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : (data?.mostClickedResources.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No clicks yet.</p>
          ) : (
            <ul className="space-y-1">
              {data!.mostClickedResources.map((r) => (
                <li key={r.resource_id} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="min-w-0 truncate text-sm text-white">{r.name}</span>
                  <span className="shrink-0 text-sm font-semibold text-muted">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card mt-5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Activity size={18} className="text-accent" />
          <h2 className="text-sm font-bold text-white">Recent activity</h2>
        </div>
        {isLoading ? (
          <ListSkeleton />
        ) : (data?.recentClicks.length ?? 0) === 0 ? (
          <EmptyState title="No activity yet" description="Clicks will show up here." />
        ) : (
          <ul className="divide-y divide-border">
            {data!.recentClicks.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate text-white">
                  Clicked <span className="font-medium">{c.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{timeAgo(c.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ClicksChart({ data }: { data: DailyCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-muted">No clicks in this range yet.</p>;
  }

  return (
    <div>
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((d) => (
          <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.count}`}>
            <div
              className="w-full rounded-t bg-accent/70 transition-colors group-hover:bg-accent"
              style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>{data[0]?.date.slice(5)}</span>
        <span className="font-medium text-white">{total} clicks</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}
