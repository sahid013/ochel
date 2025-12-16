import { useRouter } from 'next/navigation';

interface AdminTabsProps {
    activeTab: 'menu' | 'template' | 'customize' | 'settings' | 'membership' | '3d-requests';
    slug: string;
    onTabChange?: (tab: 'menu' | 'template' | 'customize' | 'settings' | 'membership' | '3d-requests') => void;
}

export function AdminTabs({ activeTab, slug, onTabChange }: AdminTabsProps) {
    const router = useRouter();

    const handleNavigation = (tab: 'menu' | 'template' | 'customize' | 'settings' | 'membership' | '3d-requests') => {
        if (onTabChange) {
            onTabChange(tab);
        }
        // Always push the new URL to ensure consistency (especially if used from subscribe page)
        router.push(`/${slug}/admin?tab=${tab}`);
    };

    return (
        <div className="border-b border-gray-200 bg-white">
            <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-8 overflow-x-auto">
                    <button
                        onClick={() => handleNavigation('menu')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'menu'
                            ? 'border-[#F34A23] text-[#F34A23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Menu Management
                    </button>
                    <button
                        onClick={() => handleNavigation('template')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'template'
                            ? 'border-[#F34A23] text-[#F34A23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Template Settings
                    </button>
                    <button
                        onClick={() => handleNavigation('customize')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'customize'
                            ? 'border-[#F34A23] text-[#F34A23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Customize
                    </button>
                    <button
                        onClick={() => handleNavigation('3d-requests')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === '3d-requests'
                            ? 'border-[#F34A23] text-[#F34A23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        3D Menu Request
                    </button>
                    <button
                        onClick={() => handleNavigation('membership')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'membership'
                            ? 'border-[#F34A23] text-[#F34A23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Membership
                    </button>
                </nav>
            </div>
        </div>
    );
}
