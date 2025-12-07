'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';
import { LandingLanguageSwitcher } from '@/components/layout/LandingLanguageSwitcher';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    const { isSuperAdmin, loading } = useSuperAdmin();
    const router = useRouter();
    const pathname = usePathname();

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
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-4 cursor-pointer" onClick={() => router.push('/super-admin')}>
                                <img
                                    src="/icons/ochellogofull.png"
                                    alt="Ochel"
                                    className="h-7 w-auto"
                                />
                                <span className="bg-[#F34A23]/10 text-[#F34A23] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Super Admin</span>
                            </div>

                        </div>
                        <div className="flex items-center gap-4">
                            <LandingLanguageSwitcher />
                            <button
                                onClick={() => router.push('/')}
                                className="text-sm font-medium text-gray-600 hover:text-[#F34A23] font-plus-jakarta-sans transition-colors"
                            >
                                {t('superAdmin.nav.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-[1460px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
