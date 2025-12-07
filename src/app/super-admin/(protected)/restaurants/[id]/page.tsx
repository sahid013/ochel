'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { TableSkeleton } from '@/components/ui/SkeletonLoader';
import { downloadMultipleFiles } from '@/utils/download';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, usually does in shadcn/tailwind setups

interface MenuItemWithDetails {
    id: number;
    title: string;
    description: string;
    price: number;
    image_path: string | null;
    additional_image_url: string | null;
    model_3d_url: string | null;
    redirect_3d_url: string | null;
    created_at: string;
    subcategory: {
        title: string;
    };
}

const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const created = new Date(createdAt).getTime();
            const now = new Date().getTime();
            const deadline = created + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const difference = deadline - now;

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setIsExpired(false);
            } else {
                setTimeLeft('00:00:00');
                setIsExpired(true);
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [createdAt]);

    return (
        <div className={`text-sm font-bold font-plus-jakarta-sans ${isExpired ? 'text-red-500' : 'text-[#F34A23]'}`}>
            {isExpired ? 'Expired' : `Time Left: ${timeLeft}`}
        </div>
    );
};

export default function RestaurantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItemWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // State for inputs
    const [editingItems, setEditingItems] = useState<{ [key: number]: { glb: string, usdz: string } }>({});
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
    }, [params.id]);

    const fetchData = async (id: string) => {
        try {
            setLoading(true);

            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select('*')
                .eq('id', id)
                .single();

            if (restaurantError) throw restaurantError;
            setRestaurant(restaurantData);

            const { data: itemsData, error: itemsError } = await supabase
                .from('menu_items')
                .select(`
                    *,
                    subcategory:subcategories(title)
                `)
                .eq('restaurant_id', id)
                .order('created_at', { ascending: false });

            if (itemsError) throw itemsError;
            setMenuItems(itemsData as any);

            // Initialize editing state
            const initialEditingState: { [key: number]: { glb: string, usdz: string } } = {};
            itemsData?.forEach((item: any) => {
                initialEditingState[item.id] = {
                    glb: item.model_3d_url || '',
                    usdz: item.redirect_3d_url || ''
                };
            });
            setEditingItems(initialEditingState);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load restaurant details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModels = async (item: MenuItemWithDetails) => {
        const updates = editingItems[item.id];
        if (!updates) return;

        try {
            setSaving(item.id);
            const { error } = await supabase
                .from('menu_items')
                .update({
                    model_3d_url: updates.glb || null,
                    redirect_3d_url: updates.usdz || null
                })
                .eq('id', item.id);

            if (error) throw error;

            // Refresh local state without full reload
            setMenuItems(prev => prev.map(i =>
                i.id === item.id
                    ? { ...i, model_3d_url: updates.glb || null, redirect_3d_url: updates.usdz || null }
                    : i
            ));

            alert('Models updated successfully!');
        } catch (error) {
            console.error('Error saving models:', error);
            alert('Failed to save models');
        } finally {
            setSaving(null);
        }
    };

    const handleDownloadImages = async (item: MenuItemWithDetails) => {
        const filesToDownload: { url: string; filename: string }[] = [];

        if (item.image_path) {
            filesToDownload.push({
                url: item.image_path,
                filename: `${item.title.replace(/\s+/g, '_')}_main.png`
            });
        }

        if (item.additional_image_url) {
            try {
                const urls: string[] = JSON.parse(item.additional_image_url);
                urls.forEach((url, index) => {
                    filesToDownload.push({
                        url: url,
                        filename: `${item.title.replace(/\s+/g, '_')}_detail_${index + 1}.png`
                    });
                });
            } catch (e) {
                console.error('Error parsing additional images:', e);
            }
        }

        if (filesToDownload.length === 0) {
            alert('No images to download for this item.');
            return;
        }

        try {
            await downloadMultipleFiles(filesToDownload);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download images');
        }
    };

    const tabs = [
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' }
    ];

    const filteredItems = menuItems.filter(item => {
        const isCompleted = item.model_3d_url && item.redirect_3d_url;
        return activeTab === 'completed' ? isCompleted : !isCompleted;
    });

    if (loading) return <div className="py-8"><TableSkeleton /></div>;
    if (!restaurant) return <div className="py-8 text-center">Restaurant not found</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-[#3D1F00]/5 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="mb-4 text-sm text-[#3D1F00]/60 hover:text-[#F34A23] flex items-center gap-2 transition-colors font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-[#3D1F00] font-loubag mb-2">{restaurant.name}</h1>
                        <div className="flex gap-6 text-sm text-[#3D1F00]/70 font-plus-jakarta-sans">
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${restaurant.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {restaurant.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span>{restaurant.email}</span>
                            <span>{restaurant.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'pending' | 'completed')}
                        className={cn(
                            'px-6 py-3 font-medium transition-all font-plus-jakarta-sans text-[13px]',
                            activeTab === tab.id
                                ? 'bg-[#F34A23] text-white scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                        style={activeTab === tab.id ? {
                            borderRadius: '0.87413rem',
                            boxShadow: '0 0 34.366px 11.988px rgba(241, 155, 135, 0.50), 0 0.999px 2.997px 0 #FDD8C7 inset'
                        } : {
                            borderRadius: '0.5rem'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#3D1F00]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#3D1F00] font-loubag">
                        {activeTab === 'pending' ? 'Pending Requests' : 'Completed Models'}
                        <span className="ml-2 text-sm text-[#F34A23] bg-[#F34A23]/10 px-2 py-1 rounded-full">{filteredItems.length}</span>
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                        const additionalImages = item.additional_image_url ? JSON.parse(item.additional_image_url) : [];
                        const hasImages = item.image_path || additionalImages.length > 0;

                        return (
                            <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-[#3D1F00] font-plus-jakarta-sans">{item.title}</h3>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-[#F34A23]/10 text-[#F34A23] text-xs font-bold uppercase tracking-wider">
                                                        {item.subcategory?.title}
                                                    </span>
                                                </div>
                                                <CountdownTimer createdAt={item.created_at} />
                                            </div>

                                            {hasImages && (
                                                <button
                                                    onClick={() => handleDownloadImages(item)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F34A23]/10 text-[#F34A23] rounded-lg hover:bg-[#F34A23]/20 transition-colors text-xs font-bold"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download Images
                                                </button>
                                            )}
                                        </div>

                                        {/* 3D Model Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-[#3D1F00]/60 mb-1 font-plus-jakarta-sans">GLB URL (Model 3D)</label>
                                                <input
                                                    type="text"
                                                    value={editingItems[item.id]?.glb || ''}
                                                    onChange={(e) => setEditingItems(prev => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], glb: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400 font-plus-jakarta-sans bg-white"
                                                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#3D1F00]/60 mb-1 font-plus-jakarta-sans">USDZ URL (Redirect 3D)</label>
                                                <input
                                                    type="text"
                                                    value={editingItems[item.id]?.usdz || ''}
                                                    onChange={(e) => setEditingItems(prev => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], usdz: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400 font-plus-jakarta-sans bg-white"
                                                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSaveModels(item)}
                                            disabled={saving === item.id}
                                            className="ml-auto block px-6 py-2 bg-[#3D1F00] text-white rounded-lg hover:bg-[#3D1F00]/80 transition-colors text-sm font-bold shadow-sm disabled:opacity-50 font-plus-jakarta-sans"
                                        >
                                            {saving === item.id ? 'Saving...' : 'Save Models'}
                                        </button>
                                    </div>

                                    {/* Image Preview Grid */}
                                    {hasImages && (
                                        <div className="w-full md:w-1/3">
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {item.image_path && (
                                                    <div className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group/img">
                                                        <img src={item.image_path} alt="Main" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                {additionalImages.map((url: string, idx: number) => (
                                                    <div key={idx} className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group/img">
                                                        <img src={url} alt={`Detail ${idx + 1}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {filteredItems.length === 0 && (
                        <div className="p-12 text-center text-gray-500 font-plus-jakarta-sans">
                            {activeTab === 'pending' ? 'No pending 3D model requests.' : 'No completed models yet.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
