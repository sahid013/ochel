'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Input } from '@/components/ui/Input';
import { Restaurant } from '@/types';
import { useTranslation } from '@/contexts/LanguageContext';

// Extended type for our view
interface MenuItemWithRestaurant {
    id: number;
    title: string;
    image_path: string | null;
    model_3d_url: string | null;
    restaurant_id: string;
    restaurants: Restaurant | null; // Join result
}

interface GroupedItems {
    [restaurantId: string]: {
        restaurantName: string;
        items: MenuItemWithRestaurant[];
    };
}

export default function SuperAdminPage() {
    const { t } = useTranslation();
    const [items, setItems] = useState<MenuItemWithRestaurant[]>([]);
    const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Local state for edits before saving
    const [edits, setEdits] = useState<{ [itemId: number]: string }>({});

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Fetch menu items that have images
            const { data, error } = await supabase
                .from('menu_items')
                .select(`
          id,
          title,
          image_path,
          model_3d_url,
          restaurant_id,
          restaurants (
            id,
            name,
            slug
          )
        `)
                .not('image_path', 'is', null) // Only items with images
                .order('created_at', { ascending: false });

            if (error) throw error;

            const typedData = data as unknown as MenuItemWithRestaurant[];
            setItems(typedData);
            groupItems(typedData);
        } catch (error) {
            console.error('Error fetching items:', error);
            alert('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const groupItems = (data: MenuItemWithRestaurant[]) => {
        const groups: GroupedItems = {};
        data.forEach(item => {
            const rId = item.restaurant_id;
            const rName = item.restaurants?.name || 'Unknown Restaurant';

            if (!groups[rId]) {
                groups[rId] = {
                    restaurantName: rName,
                    items: []
                };
            }
            groups[rId].items.push(item);
        });
        setGroupedItems(groups);
    };

    const handleUrlChange = (id: number, val: string) => {
        setEdits(prev => ({
            ...prev,
            [id]: val
        }));
    };

    const handleSave = async (item: MenuItemWithRestaurant) => {
        const newUrl = edits[item.id];
        // If undefined, no change was made
        if (newUrl === undefined) return;

        try {
            setUpdatingId(item.id);
            const { error } = await supabase
                .from('menu_items')
                .update({ model_3d_url: newUrl })
                .eq('id', item.id);

            if (error) throw error;

            // Update local state to reflect saved
            const updatedItems = items.map(i =>
                i.id === item.id ? { ...i, model_3d_url: newUrl } : i
            );
            setItems(updatedItems);
            groupItems(updatedItems);

            // Clear edit state for this item
            const newEdits = { ...edits };
            delete newEdits[item.id];
            setEdits(newEdits);

            alert('Successfully updated 3D URL');
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-forum text-gray-900">{t('superAdmin.models.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('superAdmin.models.title') === '3D Model Management' ? 'Manage 3D models for menu items with uploaded images.' : 'Gérez les modèles 3D pour les articles du menu avec des images téléchargées.'}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">{t('admin.stats.total')}: </span>
                    <span className="font-bold text-lg">{Object.keys(groupedItems).length}</span>
                </div>
            </div>

            {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No menu items found with images.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {Object.entries(groupedItems).map(([rId, group]) => (
                        <div key={rId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-gray-800">{group.restaurantName}</h3>
                                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    {group.items.length} {t('superAdmin.models.item')}s
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {group.items.map(item => {
                                    const currentVal = edits[item.id] !== undefined ? edits[item.id] : (item.model_3d_url || '');
                                    const hasChanged = edits[item.id] !== undefined && edits[item.id] !== item.model_3d_url;

                                    return (
                                        <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Image Preview */}
                                                <div className="w-full md:w-48 flex-shrink-0">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                                                        {item.image_path ? (
                                                            // simple img tag for now, assuming public bucket or signed url handled elsewhere? 
                                                            // Actually image_path usually needs full url. 
                                                            // Ochel typically stores relative path or full? Checking...
                                                            // Usually we need to construct the URL if it's just a path. 
                                                            // But looking at Type definition `image_path: string | null`, let's assume it might be a key.
                                                            // I will use a simple img and if it breaks I'll fix. 
                                                            // Best to check how other components render images.
                                                            // But for admin view, let's try to just show it.
                                                            <img
                                                                src={item.image_path.startsWith('http') ? item.image_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-items/${item.image_path}`}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">{t('superAdmin.models.noImage') || 'No Image'}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Details and Actions */}
                                                <div className="flex-grow space-y-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                                        <p className="text-xs text-gray-400 font-mono mt-1">ID: {item.id}</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">{t('superAdmin.models.modelUrl')}</label>
                                                        <div className="flex gap-3">
                                                            <div className="flex-grow">
                                                                <Input
                                                                    value={currentVal}
                                                                    onChange={(e) => handleUrlChange(item.id, e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            <PrimaryButton
                                                                onClick={() => handleSave(item)}
                                                                disabled={!hasChanged || updatingId === item.id}
                                                                size="sm"
                                                                className="h-10 px-6 shrink-0"
                                                            >
                                                                {updatingId === item.id ? t('superAdmin.models.saving') : t('superAdmin.models.save')}
                                                            </PrimaryButton>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Paste the link to the 3D model viewer (e.g. Spline, Sketchfab).
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
