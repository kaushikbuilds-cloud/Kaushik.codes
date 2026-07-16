import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Link2, PackageOpen } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ResourceCard } from '@/components/ResourceCard';
import { ShareButton } from '@/components/ShareButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { FullScreenSpinner } from '@/components/ui/Spinner';
import { usePostBySlug } from '@/features/posts/usePosts';
import { trackPostView } from '@/services/analytics';
import { useSeo } from '@/hooks/useSeo';
import { env } from '@/lib/env';
import { formatDate } from '@/utils/date';

export function ResourcePage() {
  const { slug = '' } = useParams();
  const { data: post, isLoading, isError } = usePostBySlug(slug);
  const trackedRef = useRef<string | null>(null);

  // Record a single anonymous view per post per mount.
  useEffect(() => {
    if (post && post.status === 'published' && trackedRef.current !== post.id) {
      trackedRef.current = post.id;
      void trackPostView(post.id);
    }
  }, [post]);

  useSeo({
    title: post ? `${post.title} — Kaushik Codes` : 'Kaushik Codes',
    description: post?.short_description || post?.full_description || undefined,
    image: post?.thumbnail_url ?? undefined,
    path: `/links/${slug}`,
    type: 'article',
    noindex: !post || post.status !== 'published',
  });

  if (isLoading) return <FullScreenSpinner />;

  if (isError || !post) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={<PackageOpen size={40} />}
          title="Bro antha link kandupidikala 😭"
          description="This resource page doesnt exist or was removed."
          action={
            <Link to="/" className="btn-primary">
              Back home
            </Link>
          }
        />
      </div>
    );
  }

  const shareUrl = `${env.siteUrl}/links/${post.slug}`;

  return (
    <div className="container-app py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <SmartImage
          src={post.thumbnail_url}
          alt={post.title}
          className="aspect-[16/9] w-full rounded-2xl border border-border"
          fallback={
            <CategoryIcon
              name={post.category?.icon ?? 'Sparkles'}
              size={48}
              className="text-border-soft"
            />
          }
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.category && <CategoryBadge name={post.category.name} />}
          <span className="text-xs text-muted">{formatDate(post.published_at)}</span>
        </div>

        <h1 className="mt-3 text-xl font-extrabold leading-tight text-white sm:text-2xl">
          {post.title}
        </h1>

        {post.short_description && (
          <p className="mt-2 text-sm text-muted sm:text-base">{post.short_description}</p>
        )}

        {post.full_description && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">
            {post.full_description}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-border bg-bg-soft px-2.5 py-0.5 text-[11px] text-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <ShareButton
            title={post.title}
            text={post.short_description}
            url={shareUrl}
            className="btn-secondary flex-1 sm:flex-none"
          />
        </div>
      </motion.article>

      {/* Resources */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Link2 size={18} className="text-accent" />
          <h2 className="text-base font-bold text-white">Links from this video 👇</h2>
        </div>

        {post.resources.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={36} />}
            title="Innum links add pannala bro 👀"
            description="Links for this video are coming soon."
          />
        ) : (
          <div className="space-y-2.5">
            {post.resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
