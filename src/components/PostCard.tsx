import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Link2 } from 'lucide-react';
import { CategoryBadge, NewBadge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { formatDate, isRecent } from '@/utils/date';
import type { PostListItem } from '@/types/database';

export function PostCard({ post }: { post: PostListItem }) {
  const showNew = isRecent(post.published_at, 7);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      className="card overflow-hidden"
    >
      <Link to={`/links/${post.slug}`} className="block">
        <div className="relative">
          <SmartImage
            src={post.thumbnail_url}
            alt={post.title}
            className="aspect-[16/9] w-full"
            fallback={
              <CategoryIcon
                name={post.category?.icon ?? 'Sparkles'}
                size={40}
                className="text-border-soft"
              />
            }
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {showNew && <NewBadge />}
            {post.category && (
              <CategoryBadge name={post.category.name} className="bg-black/50 backdrop-blur" />
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 text-base font-semibold text-white">{post.title}</h3>
          {post.short_description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted">{post.short_description}</p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Link2 size={14} />
              {post.resource_count} {post.resource_count === 1 ? 'link' : 'links'}
            </span>
            <span>{formatDate(post.published_at)}</span>
          </div>

          <span className="btn-primary mt-4 w-full">
            View Links
            <ArrowRight size={16} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
