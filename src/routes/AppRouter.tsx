import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { HomePage } from '@/pages/HomePage';
import { ScrollToTop } from './ScrollToTop';
import { ProtectedRoute } from './ProtectedRoute';
import { FullScreenSpinner } from '@/components/ui/Spinner';

// Public detail page — split out so the homepage bundle stays tiny.
const ResourcePage = lazy(() =>
  import('@/pages/ResourcePage').then((m) => ({ default: m.ResourcePage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

// Admin — entirely lazy so public visitors never download it.
const AdminLayout = lazy(() =>
  import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const LoginPage = lazy(() =>
  import('@/pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const PostsListPage = lazy(() =>
  import('@/pages/admin/PostsListPage').then((m) => ({ default: m.PostsListPage })),
);
const PostEditorPage = lazy(() =>
  import('@/pages/admin/PostEditorPage').then((m) => ({ default: m.PostEditorPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullScreenSpinner />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="links/:slug" element={<ResourcePage />} />
          </Route>

          {/* Admin auth */}
          <Route path="admin/login" element={<LoginPage />} />

          {/* Admin (protected) */}
          <Route path="admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="posts" element={<PostsListPage />} />
              <Route path="posts/new" element={<PostEditorPage />} />
              <Route path="posts/:id" element={<PostEditorPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
