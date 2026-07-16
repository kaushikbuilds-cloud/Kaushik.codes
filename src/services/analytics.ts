import { supabase } from '@/lib/supabase';

/**
 * Anonymous analytics. We store ONLY a post/resource id and a timestamp.
 * No IP addresses, no user agents, no cookies, no PII of any kind.
 */

/** Record a view of a post. Fire-and-forget — never blocks the UI. */
export async function trackPostView(postId: string): Promise<void> {
  const { error } = await supabase.from('post_views').insert({ post_id: postId });
  if (error) {
    // Analytics must never break the page — log and move on.
    console.warn('trackPostView failed', error.message);
  }
}

/** Record a click on a resource. Fire-and-forget. */
export async function trackResourceClick(
  resourceId: string,
  postId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('resource_clicks')
    .insert({ resource_id: resourceId, post_id: postId });
  if (error) {
    console.warn('trackResourceClick failed', error.message);
  }
}

// ---------------------------------------------------------------------------
// Admin analytics reads (gated by RLS to admins).
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalResources: number;
  totalClicks: number;
  totalViews: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [total, published, draft, resources, clicks, views] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('resource_clicks').select('id', { count: 'exact', head: true }),
    supabase.from('post_views').select('id', { count: 'exact', head: true }),
  ]);

  for (const r of [total, published, draft, resources, clicks, views]) {
    if (r.error) throw r.error;
  }

  return {
    totalPosts: total.count ?? 0,
    publishedPosts: published.count ?? 0,
    draftPosts: draft.count ?? 0,
    totalResources: resources.count ?? 0,
    totalClicks: clicks.count ?? 0,
    totalViews: views.count ?? 0,
  };
}

export interface RankedPost {
  post_id: string;
  title: string;
  slug: string;
  count: number;
}

export interface RankedResource {
  resource_id: string;
  name: string;
  count: number;
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AnalyticsSummary {
  mostViewedPosts: RankedPost[];
  mostClickedResources: RankedResource[];
  clicksByDate: DailyCount[];
  recentClicks: { name: string; created_at: string }[];
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Build the analytics summary for the last `rangeDays` days.
 * Aggregation is done client-side over the raw event rows — fine for the
 * volumes a link hub sees, and keeps us off any server functions.
 */
export async function fetchAnalytics(rangeDays = 30): Promise<AnalyticsSummary> {
  const since = daysAgoIso(rangeDays);

  const [viewsRes, clicksRes] = await Promise.all([
    supabase
      .from('post_views')
      .select('post_id, created_at, posts(title, slug)')
      .gte('created_at', since),
    supabase
      .from('resource_clicks')
      .select('resource_id, post_id, created_at, resources(name)')
      .gte('created_at', since),
  ]);

  if (viewsRes.error) throw viewsRes.error;
  if (clicksRes.error) throw clicksRes.error;

  type ViewRow = {
    post_id: string;
    created_at: string;
    posts: { title: string; slug: string } | null;
  };
  type ClickRow = {
    resource_id: string;
    post_id: string | null;
    created_at: string;
    resources: { name: string } | null;
  };

  const views = (viewsRes.data ?? []) as unknown as ViewRow[];
  const clicks = (clicksRes.data ?? []) as unknown as ClickRow[];

  // Most viewed posts
  const postMap = new Map<string, RankedPost>();
  for (const v of views) {
    const existing = postMap.get(v.post_id);
    if (existing) existing.count += 1;
    else
      postMap.set(v.post_id, {
        post_id: v.post_id,
        title: v.posts?.title ?? 'Untitled',
        slug: v.posts?.slug ?? '',
        count: 1,
      });
  }
  const mostViewedPosts = [...postMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Most clicked resources
  const resMap = new Map<string, RankedResource>();
  for (const c of clicks) {
    const existing = resMap.get(c.resource_id);
    if (existing) existing.count += 1;
    else
      resMap.set(c.resource_id, {
        resource_id: c.resource_id,
        name: c.resources?.name ?? 'Removed resource',
        count: 1,
      });
  }
  const mostClickedResources = [...resMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Clicks by date (fill gaps with 0 across the range)
  const byDate = new Map<string, number>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDate.set(d.toISOString().slice(0, 10), 0);
  }
  for (const c of clicks) {
    const key = c.created_at.slice(0, 10);
    if (byDate.has(key)) byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }
  const clicksByDate: DailyCount[] = [...byDate.entries()].map(([date, count]) => ({
    date,
    count,
  }));

  // Recent activity (latest clicks)
  const recentClicks = [...clicks]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 12)
    .map((c) => ({ name: c.resources?.name ?? 'Removed resource', created_at: c.created_at }));

  return { mostViewedPosts, mostClickedResources, clicksByDate, recentClicks };
}
