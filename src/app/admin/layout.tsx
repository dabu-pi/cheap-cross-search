import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata = {
  title: '管理画面 — ECサイト比較.com',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-5">
        {children}
      </main>
    </div>
  );
}
