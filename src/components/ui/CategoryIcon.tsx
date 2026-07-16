import {
  Bot,
  Braces,
  Brush,
  Code2,
  Cpu,
  Database,
  Folder,
  GraduationCap,
  Hammer,
  Layers,
  Layout,
  Lightbulb,
  Package,
  PenTool,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Curated map of Lucide icon names usable for categories.
 * Admins choose from these in the category form.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Folder,
  Sparkles,
  Bot,
  Cpu,
  Code2,
  Braces,
  Terminal,
  Layout,
  Smartphone,
  Server,
  Database,
  Package,
  Layers,
  Rocket,
  Zap,
  Wrench,
  Hammer,
  PenTool,
  Brush,
  Lightbulb,
  GraduationCap,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function CategoryIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[name] ?? Folder;
  return <Icon size={size} className={className} />;
}
