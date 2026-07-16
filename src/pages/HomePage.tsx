import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, SearchX } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostGridSkeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/useSettings';
import { useCategories } from '@/features/categories/useCategories';
import { useSearchIndex, useFilteredPosts } from '@/features/posts/useSearchIndex';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';

export function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 150);

  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const { data: posts, isLoading, isError, refetch } = useSearchIndex();

  const filtered = useFilteredPosts(posts, debouncedQuery, category);

  const heroTitle = settings?.hero_title ?? 'Enna link thedura bro? 👀';
  const heroSubtitle =
    settings?.hero_subtitle ??
    'Videos la sonna AI tools, coding resources, websites & apps ellame inga iruku.';
  const placeholder = settings?.search_placeholder ?? 'Search AI tools, coding, websites...';

  useSeo({
    title: `${settings?.site_name ?? 'Kaushik Codes'} — AI Tools, Coding & Developer Resources`,
    description:
      settings?.subtitle ??
      'Every AI tool, coding resource, website & app from @kaushik_codes videos — searchable in one place.',
    path: '/',
  });

  const searching = debouncedQuery.trim().length > 0 || category !== null;

  return (
    <div className="container-app pb-4 pt-8 sm:pt-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {heroTitle}
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-sm text-muted sm:text-base">{heroSubtitle}</p>
        <div className="mx-auto mt-6 max-w-xl">
          <SearchBar value={query} onChange={setQuery} placeholder={placeholder} />
        </div>
      </motion.section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mt-6">
          <CategoryChips categories={categories} active={category} onSelect={setCategory} />
        </section>
      )}

      {/* Latest / Results */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Flame size={18} className="text-accent" />
          <h2 className="text-lg font-bold text-white">
            {searching ? 'Results' : 'Latest Links'}
          </h2>
          {!isLoading && (
            <span className="text-sm text-muted">({filtered.length})</span>
          )}
        </div>

        {isLoading ? (
          <PostGridSkeleton />
        ) : isError ? (
          <EmptyState
            icon={<SearchX size={40} />}
            title="Something went wrong"
            description="Couldnt load the links. Check your connection and try again."
            action={
              <button className="btn-secondary" onClick={() => refetch()}>
                Retry
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          debouncedQuery.trim() ? (
            <EmptyState
              icon={<SearchX size={40} />}
              title="Bro antha link kandupidikala 😭"
              description="Try a different keyword or clear the search."
            />
          ) : (
            <EmptyState
              icon={<Flame size={40} />}
              title="Innum links add pannala bro 👀"
              description="New resources are on the way — check back soon!"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
