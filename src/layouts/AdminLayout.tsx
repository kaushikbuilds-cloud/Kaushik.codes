import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast('Logged out 👋', 'info');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-bg lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-bg-soft lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <LayoutDashboard size={16} />
          </span>
          <span className="text-sm font-bold text-white">Kaushik Codes</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <p className="mb-2 truncate px-2 text-xs text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg-elevated hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <span className="text-sm font-bold text-white">Kaushik Codes</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-white"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 pb-24 lg:pb-8">
          <div className="container-admin py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg-soft/95 backdrop-blur lg:hidden">
        {NAV.map((item) => (
          <BottomLink key={item.to} item={item} />
        ))}
      </nav>
    </div>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent/15 text-white'
            : 'text-muted hover:bg-bg-elevated hover:text-white',
        )
      }
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}

function BottomLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
          isActive ? 'text-accent' : 'text-muted',
        )
      }
    >
      <Icon size={20} />
      {item.label}
    </NavLink>
  );
}
