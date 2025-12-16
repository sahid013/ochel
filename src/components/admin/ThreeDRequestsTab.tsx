import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ImageUploader } from '@/components/demo/ImageUploader';
import { uploadImage } from '@/lib/storage';
import { PrimaryButton } from '@/components/ui';


interface ThreeDRequestsTabProps {
    restaurant: Restaurant;
}

interface RequestItem {
    id: number;
    title: string;
    status: 'pending' | 'completed';
    additional_image_url: string | null; // JSON string of array
    model_3d_url: string | null;
    created_at: string;
}

function ThreeDRequestItem({ item, restaurantId, onUpdate }: { item: RequestItem, restaurantId: string, onUpdate: () => void }) {
    const [images, setImages] = useState<(File | string | null)[]>([null, null, null, null]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize images from item prop
    useEffect(() => {
        try {
            const parsedImages = item.additional_image_url ? JSON.parse(item.additional_image_url) : [];
            const newImages = [...parsedImages];
            while (newImages.length < 4) newImages.push(null);
            setImages(newImages.slice(0, 4));
            setHasChanges(false);
        } catch (e) {
            setImages([null, null, null, null]);
        }
    }, [item.additional_image_url]);

    const handleImagesChange = (newImages: (File | string | null)[]) => {
        setImages(newImages);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        try {
            setIsUpdating(true);
            const newImageUrls: string[] = [];

            for (const img of images) {
                if (img instanceof File) {
                    const { publicUrl } = await uploadImage(img, 'menu-item', restaurantId);
                    newImageUrls.push(publicUrl);
                } else if (typeof img === 'string') {
                    newImageUrls.push(img);
                }
            }

            const { error } = await supabase
                .from('menu_items')
                .update({
                    additional_image_url: JSON.stringify(newImageUrls)
                })
                .eq('id', item.id);

            if (error) throw error;

            setHasChanges(false);
            onUpdate(); // Refresh list to sync valid server state
        } catch (err) {
            console.error('Error updating images:', err);
            alert('Failed to update images');
        } finally {
            setIsUpdating(false);
        }
    };

    const isPending = item.status === 'pending';
    // If pending, allow drag/drop. If completed, maybe read-only? 
    // User said "request is in still pending state". 
    // I will assume completed requests behave like read-only view.

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-full md:w-1/4">
                <h3 className="text-lg font-bold font-plus-jakarta-sans text-gray-900">{item.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {item.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                </div>
                {isPending && hasChanges && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <PrimaryButton
                            onClick={handleSave}
                            disabled={isUpdating}
                            size="sm"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                )}
            </div>

            <div className="flex-grow w-full md:w-3/4">
                {isPending ? (
                    <ImageUploader
                        images={images}
                        onImagesChange={handleImagesChange}
                        maxImages={4}
                        labels={['Top view', 'Right view', 'Bottom view', 'Left view']}
                        loadingText="Uploading..."
                        aspectRatio="h-32 w-full"
                        instanceId={`req-${item.id}`}
                        className="mt-0"
                    />
                ) : (
                    // Read-only view for completed
                    <div className="grid grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                {img ? (
                                    <img
                                        src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                        alt={`View ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-300">
                                        <span className="text-xs">No image</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ThreeDRequestsTab({ restaurant }: ThreeDRequestsTabProps) {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            // Only show loader on initial fetch if empty?? 
            // Or just keep it simple.
            // setLoading(true); // Don't reset loading on refresh to avoid flashing
            const { data, error } = await supabase
                .from('menu_items')
                .select('id, title, additional_image_url, model_3d_url, created_at')
                .eq('restaurant_id', restaurant.id)
                .not('additional_image_url', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedRequests: RequestItem[] = (data || []).map((item: any) => ({
                ...item,
                status: item.model_3d_url ? 'completed' : 'pending' as const
            }));

            setRequests(formattedRequests);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchRequests();
    }, [restaurant.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold font-loubag text-primary mb-2">3D Menu Requests</h2>
                <p className="text-gray-600 font-plus-jakarta-sans text-sm md:text-base">
                    Track your 3D model generation requests and manage uploaded images
                </p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="max-w-md mx-auto px-4">
                        <div className="w-16 h-16 bg-[#F34A23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#F34A23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 font-plus-jakarta-sans">No 3D Requests Yet</h3>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((item) => (
                        <ThreeDRequestItem
                            key={item.id}
                            item={item}
                            restaurantId={restaurant.id}
                            onUpdate={fetchRequests}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
