import { useState, type FormEvent } from 'react';
import { FolderPlus, GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/useCategories';
import { countPostsInCategory } from '@/services/categories';
import { CategoryIcon, CATEGORY_ICON_NAMES } from '@/components/ui/CategoryIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import type { Category } from '@/types/database';

interface EditState {
  id?: string;
  name: string;
  icon: string;
  sort_order: number;
}

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();
  useSeo({ title: 'Categories — Kaushik Codes Admin', noindex: true });

  const [editing, setEditing] = useState<EditState | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleteCount, setDeleteCount] = useState<number>(0);

  const openNew = () =>
    setEditing({
      name: '',
      icon: 'Folder',
      sort_order: (categories?.length ?? 0) + 1,
    });

  const openEdit = (cat: Category) =>
    setEditing({ id: cat.id, name: cat.name, icon: cat.icon, sort_order: cat.sort_order });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return;
    try {
      if (editing.id) {
        await updateCategory.mutateAsync({
          id: editing.id,
          input: { name: editing.name, icon: editing.icon, sort_order: editing.sort_order },
        });
        toast('Category updated', 'success');
      } else {
        await createCategory.mutateAsync({
          name: editing.name,
          icon: editing.icon,
          sort_order: editing.sort_order,
        });
        toast('Category created', 'success');
      }
      setEditing(null);
    } catch (err) {
      toast(getErrorMessage(err, 'Save failed'), 'error');
    }
  };

  const askDelete = async (cat: Category) => {
    setToDelete(cat);
    try {
      setDeleteCount(await countPostsInCategory(cat.id));
    } catch {
      setDeleteCount(0);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory.mutateAsync(toDelete.id);
      toast('Category deleted', 'info');
      setToDelete(null);
    } catch (err) {
      toast(getErrorMessage(err, 'Delete failed'), 'error');
    }
  };

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Categories</h1>
          <p className="text-sm text-muted">Organise your posts</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus size={16} />
          <span className="hidden sm:inline">New Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading…</div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={<FolderPlus size={40} />}
          title="No categories yet"
          description="Create categories to organise and filter your posts."
          action={
            <button type="button" onClick={openNew} className="btn-primary">
              New Category
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-border">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <GripVertical size={16} className="shrink-0 text-border-soft" />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <CategoryIcon name={cat.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{cat.name}</p>
                <p className="text-xs text-muted">
                  /{cat.slug} · order {cat.sort_order}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(cat)}
                className="rounded-lg p-2 text-muted hover:bg-bg-elevated hover:text-white"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => askDelete(cat)}
                className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md rounded-b-none p-5 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editing.id ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-muted hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. AI Tools"
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Icon</label>
                <div className="grid max-h-40 grid-cols-7 gap-2 overflow-y-auto rounded-xl border border-border bg-bg-soft p-2">
                  {CATEGORY_ICON_NAMES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setEditing({ ...editing, icon: name })}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-lg border transition-colors',
                        editing.icon === name
                          ? 'border-accent bg-accent/15 text-accent'
                          : 'border-transparent text-muted hover:bg-bg-elevated hover:text-white',
                      )}
                      title={name}
                    >
                      <CategoryIcon name={name} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Sort order</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving || !editing.name.trim()}>
                {saving && <Spinner size={16} />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this category?"
        description={
          <>
            {deleteCount > 0 ? (
              <>
                <span className="font-medium text-amber-400">{deleteCount} post(s)</span> use this
                category. They will become <span className="font-medium">Uncategorised</span> (not
                deleted).
              </>
            ) : (
              'This category will be permanently removed.'
            )}
          </>
        }
        loading={deleteCategory.isPending}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
