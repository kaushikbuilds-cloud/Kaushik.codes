import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { isValidUrl, normalizeUrl } from '@/utils/url';
import { cn } from '@/utils/cn';
import type { ResourceBadge } from '@/types/database';

export interface ResourceFormItem {
  key: string; // stable client id for list keys
  id?: string; // existing db id (unused on save — we replace)
  name: string;
  url: string;
  description: string;
  image_url: string | null;
  badge: ResourceBadge | null;
}

const BADGES: ResourceBadge[] = ['FREE', 'PAID', 'FREEMIUM', 'NEW'];

export function newResourceItem(): ResourceFormItem {
  return {
    key: crypto.randomUUID(),
    name: '',
    url: '',
    description: '',
    image_url: null,
    badge: null,
  };
}

export function ResourceListEditor({
  resources,
  onChange,
}: {
  resources: ResourceFormItem[];
  onChange: (next: ResourceFormItem[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const update = (index: number, patch: Partial<ResourceFormItem>) => {
    onChange(resources.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const remove = (index: number) => {
    onChange(resources.filter((_, i) => i !== index));
  };

  const add = () => onChange([...resources, newResourceItem()]);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...resources];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {resources.map((resource, index) => {
        const urlTouched = resource.url.trim().length > 0;
        const urlValid = isValidUrl(normalizeUrl(resource.url));

        return (
          <div
            key={resource.key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnter={() => setOverIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => {
              if (dragIndex !== null && overIndex !== null) reorder(dragIndex, overIndex);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              'card p-3 transition-shadow',
              dragIndex === index && 'opacity-60',
              overIndex === index && dragIndex !== index && 'ring-1 ring-accent',
            )}
          >
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <button
                  type="button"
                  className="cursor-grab text-muted active:cursor-grabbing"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                >
                  <GripVertical size={18} />
                </button>
                <span className="text-xs font-semibold text-muted">{index + 1}</span>
              </div>

              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[auto,1fr]">
                  <ImageUpload
                    value={resource.image_url}
                    onChange={(url) => update(index, { image_url: url })}
                    folder="resources"
                    aspect="square"
                    className="w-20 sm:w-20"
                  />
                  <div className="space-y-2.5">
                    <input
                      value={resource.name}
                      onChange={(e) => update(index, { name: e.target.value })}
                      placeholder="Resource name *"
                      className="input"
                    />
                    <div>
                      <input
                        value={resource.url}
                        onChange={(e) => update(index, { url: e.target.value })}
                        placeholder="https://... *"
                        inputMode="url"
                        className={cn(
                          'input',
                          urlTouched && !urlValid && 'border-red-500/60 focus:border-red-500',
                        )}
                      />
                      {urlTouched && !urlValid && (
                        <p className="mt-1 text-xs text-red-400">Enter a valid URL</p>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  value={resource.description}
                  onChange={(e) => update(index, { description: e.target.value })}
                  placeholder="Short description (optional)"
                  className="input"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <BadgeToggle
                      active={resource.badge === null}
                      onClick={() => update(index, { badge: null })}
                      label="None"
                    />
                    {BADGES.map((b) => (
                      <BadgeToggle
                        key={b}
                        active={resource.badge === b}
                        onClick={() => update(index, { badge: b })}
                        label={b}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="shrink-0 rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Remove resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="btn-secondary w-full border-dashed"
      >
        <Plus size={16} />
        Add resource
      </button>
    </div>
  );
}

function BadgeToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
        active
          ? 'border-accent bg-accent/15 text-white'
          : 'border-border bg-bg-soft text-muted hover:text-white',
      )}
    >
      {label}
    </button>
  );
}
