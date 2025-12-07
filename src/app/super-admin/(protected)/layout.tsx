'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    const { isSuperAdmin, loading } = useSuperAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isSuperAdmin) {
            router.push('/super-admin/login');
        }
    }, [isSuperAdmin, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isSuperAdmin) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-4">
                                <h1 className="text-xl font-bold font-forum text-gray-900 cursor-pointer" onClick={() => router.push('/super-admin')}>
                                    Ochel Super Admin
                                </h1>
                                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin Access</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a
                                    href="/super-admin"
                                    className="border-transparent text-gray-500 hover:border-orange-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    {t('superAdmin.nav.restaurants')}
                                </a>
                                <a
                                    href="/super-admin/3d-models"
                                    className="border-transparent text-gray-500 hover:border-orange-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    {t('superAdmin.nav.3dModels')}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push('/')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                {t('superAdmin.nav.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
