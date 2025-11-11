'use client';

import { PageLayout } from '@/components/layout';
import { AdminHeader, MenuManagementTab } from '@/components/admin';

export default function AdminPage() {
  return (
    <PageLayout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50 md:bg-white font-forum">
        <AdminHeader />

        {/* Desktop Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MenuManagementTab />
        </div>
      </div>
    </PageLayout>
  );
}