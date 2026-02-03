// ============================================================
// NIL Perfumes - Admin Layout Component
// ============================================================

import { Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { AdminNav } from './AdminNav';

export function AdminLayout() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {/* Sidebar Navigation */}
        <AdminNav />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  );
}
