import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/features/settings/useSettings';
import { Spinner, FullScreenSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { normalizeUrl } from '@/utils/url';
import { useSeo } from '@/hooks/useSeo';
import type { SettingsUpdate } from '@/services/settings';

type FormFields = SettingsUpdate;

const FIELDS: { key: keyof FormFields; label: string; hint?: string; textarea?: boolean }[] = [
  { key: 'site_name', label: 'Site Name' },
  { key: 'subtitle', label: 'Subtitle', hint: 'Shown under the site name in the header' },
  { key: 'hero_title', label: 'Hero Title' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', textarea: true },
  { key: 'search_placeholder', label: 'Search Placeholder' },
  { key: 'instagram_username', label: 'Instagram Username', hint: 'Without the @' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'footer_text', label: 'Footer Text' },
];

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  useSeo({ title: 'Settings — Kaushik Codes Admin', noindex: true });

  const [form, setForm] = useState<FormFields>({});

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name,
        subtitle: settings.subtitle,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        search_placeholder: settings.search_placeholder,
        instagram_username: settings.instagram_username,
        instagram_url: settings.instagram_url,
        footer_text: settings.footer_text,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const patch: FormFields = {
      ...form,
      instagram_username: form.instagram_username?.replace(/^@/, '').trim(),
      instagram_url: form.instagram_url ? normalizeUrl(form.instagram_url) : form.instagram_url,
    };
    try {
      await updateSettings.mutateAsync({ id: settings.id, patch });
      toast('Settings saved ✅', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    }
  };

  if (isLoading || !settings) return <FullScreenSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-white">Settings</h1>
      <p className="mb-5 text-sm text-muted">Customise the public site content</p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="label">
              {field.label}
            </label>
            {field.textarea ? (
              <textarea
                id={field.key}
                value={(form[field.key] as string) ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                rows={3}
                className="input resize-y"
              />
            ) : (
              <input
                id={field.key}
                value={(form[field.key] as string) ?? ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="input"
              />
            )}
            {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
          </div>
        ))}

        <div className="flex justify-end pt-1">
          <button type="submit" className="btn-primary" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? <Spinner size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
