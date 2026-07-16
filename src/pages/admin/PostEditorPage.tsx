import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  ResourceListEditor,
  newResourceItem,
  type ResourceFormItem,
} from '@/components/admin/ResourceListEditor';
import { Spinner, FullScreenSpinner } from '@/components/ui/Spinner';
import { useCategories } from '@/features/categories/useCategories';
import { useAdminPost, useCreatePost, useUpdatePost } from '@/features/posts/usePosts';
import { useToast } from '@/contexts/ToastContext';
import { slugify } from '@/utils/slug';
import { isValidUrl, normalizeUrl } from '@/utils/url';
import { useSeo } from '@/hooks/useSeo';
import type { PostInput } from '@/services/posts';
import type { PostStatus } from '@/types/database';

interface FormState {
  title: string;
  slug: string;
  slugManuallyEdited: boolean;
  short_description: string;
  full_description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  tags: string;
  resources: ResourceFormItem[];
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  slugManuallyEdited: false,
  short_description: '',
  full_description: '',
  category_id: null,
  thumbnail_url: null,
  tags: '',
  resources: [newResourceItem()],
};

export function PostEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories } = useCategories();
  const { data: existing, isLoading: loadingPost } = useAdminPost(id);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState<PostStatus | null>(null);

  useSeo({ title: isEdit ? 'Edit post — Admin' : 'New post — Admin', noindex: true });

  // Hydrate the form when editing.
  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        slugManuallyEdited: true,
        short_description: existing.short_description,
        full_description: existing.full_description,
        category_id: existing.category_id,
        thumbnail_url: existing.thumbnail_url,
        tags: existing.tags.map((t) => t.name).join(', '),
        resources:
          existing.resources.length > 0
            ? existing.resources.map((r) => ({
                key: r.id,
                id: r.id,
                name: r.name,
                url: r.url,
                description: r.description,
                image_url: r.image_url,
                badge: r.badge,
              }))
            : [newResourceItem()],
      });
    }
  }, [existing]);

  const patch = (p: Partial<FormState>) => setForm((prev) => ({ ...prev, ...p }));

  const handleTitle = (title: string) => {
    patch({
      title,
      slug: form.slugManuallyEdited ? form.slug : slugify(title),
    });
  };

  const derivedSlug = useMemo(
    () => form.slug || slugify(form.title),
    [form.slug, form.title],
  );

  const validate = (): { ok: boolean; input?: PostInput } => {
    const problems: string[] = [];
    if (!form.title.trim()) problems.push('Title is required.');

    const cleanResources = form.resources.filter(
      (r) => r.name.trim() || r.url.trim(),
    );
    for (const r of cleanResources) {
      if (!r.name.trim()) problems.push(`A resource is missing a name.`);
      if (!isValidUrl(normalizeUrl(r.url)))
        problems.push(`Resource "${r.name || 'unnamed'}" has an invalid URL.`);
    }

    setErrors(problems);
    if (problems.length > 0) return { ok: false };

    const input: PostInput = {
      title: form.title,
      slug: derivedSlug,
      short_description: form.short_description,
      full_description: form.full_description,
      category_id: form.category_id,
      thumbnail_url: form.thumbnail_url,
      status: 'draft', // overwritten by caller
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      resources: cleanResources.map((r) => ({
        name: r.name,
        url: normalizeUrl(r.url),
        description: r.description,
        image_url: r.image_url,
        badge: r.badge,
      })),
    };
    return { ok: true, input };
  };

  const submit = async (status: PostStatus) => {
    const { ok, input } = validate();
    if (!ok || !input) return;
    setSaving(status);
    try {
      const payload = { ...input, status };
      if (isEdit && id) {
        await updatePost.mutateAsync({ id, input: payload });
        toast(status === 'published' ? 'Post published successfully 🚀' : 'Draft saved ✅', 'success');
      } else {
        await createPost.mutateAsync(payload);
        toast(status === 'published' ? 'Post published successfully 🚀' : 'Draft saved ✅', 'success');
      }
      navigate('/admin/posts');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (isEdit && loadingPost) return <FullScreenSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/admin/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to posts
      </Link>

      <h1 className="mb-5 text-xl font-bold text-white">
        {isEdit ? 'Edit Post' : 'New Post'}
      </h1>

      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <ul className="list-inside list-disc space-y-0.5">
            {Array.from(new Set(errors)).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-5">
        {/* Basic fields */}
        <div className="card space-y-4 p-4">
          <div>
            <label htmlFor="title" className="label">
              Title *
            </label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder="e.g. 5 AI tools every student needs"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="slug" className="label">
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">/links/</span>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  patch({ slug: slugify(e.target.value), slugManuallyEdited: true })
                }
                placeholder={slugify(form.title) || 'auto-generated'}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="short" className="label">
              Short Description
            </label>
            <input
              id="short"
              value={form.short_description}
              onChange={(e) => patch({ short_description: e.target.value })}
              placeholder="One line shown on cards & previews"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="full" className="label">
              Full Description
            </label>
            <textarea
              id="full"
              value={form.full_description}
              onChange={(e) => patch({ full_description: e.target.value })}
              placeholder="Longer description shown on the resource page"
              rows={4}
              className="input resize-y"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="label">
                Category
              </label>
              <select
                id="category"
                value={form.category_id ?? ''}
                onChange={(e) => patch({ category_id: e.target.value || null })}
                className="input"
              >
                <option value="">Uncategorised</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <input
                id="tags"
                value={form.tags}
                onChange={(e) => patch({ tags: e.target.value })}
                placeholder="ai, coding, free (comma separated)"
                className="input"
              />
            </div>
          </div>

          <ImageUpload
            value={form.thumbnail_url}
            onChange={(url) => patch({ thumbnail_url: url })}
            folder="thumbnails"
            label="Thumbnail"
          />
        </div>

        {/* Resources */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Resources</h2>
            <span className="text-xs text-muted">Drag to reorder</span>
          </div>
          <ResourceListEditor
            resources={form.resources}
            onChange={(next) => patch({ resources: next })}
          />
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0">
          <button
            type="button"
            onClick={() => submit('draft')}
            disabled={saving !== null}
            className="btn-secondary flex-1"
          >
            {saving === 'draft' ? <Spinner size={16} /> : <Save size={16} />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => submit('published')}
            disabled={saving !== null}
            className="btn-primary flex-1"
          >
            {saving === 'published' ? <Spinner size={16} /> : <Send size={16} />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
