'use client';

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

export function ThreeDRequestsTab({ restaurant }: ThreeDRequestsTabProps) {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedImages, setSelectedImages] = useState<(File | string | null)[]>([null, null, null, null]);
    const [updating, setUpdating] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
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
        fetchRequests();
    }, [restaurant.id]);

    const handleEdit = (item: RequestItem) => {
        setEditingId(item.id);
        try {
            const images = item.additional_image_url ? JSON.parse(item.additional_image_url) : [];
            // Pad to 4 images
            while (images.length < 4) images.push(null);
            setSelectedImages(images.slice(0, 4));
        } catch (e) {
            setSelectedImages([null, null, null, null]);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setSelectedImages([null, null, null, null]);
    };

    const handleUpdate = async (itemId: number) => {
        try {
            setUpdating(true);
            const newImageUrls: string[] = [];

            for (const img of selectedImages) {
                if (img instanceof File) {
                    const { publicUrl } = await uploadImage(img, 'menu-item', restaurant.id);
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
                .eq('id', itemId);

            if (error) throw error;

            await fetchRequests();
            setEditingId(null);
            setSelectedImages([null, null, null, null]);
        } catch (err) {
            console.error('Error updating images:', err);
            alert('Failed to update images. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

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
                    {requests.map((item) => {
                        // Parse the images
                        let images: string[] = [];
                        try {
                            images = item.additional_image_url ? JSON.parse(item.additional_image_url) : [];
                        } catch (e) {
                            console.error('Failed to parse images:', e);
                        }

                        const isEditing = editingId === item.id;

                        return (
                            <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        {/* Left side - Info */}
                                        <div className="flex-shrink-0">
                                            <h3 className="text-lg font-bold font-plus-jakarta-sans text-gray-900">{item.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {item.status === 'completed' ? 'Completed' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Requested on {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right side - Edit button (desktop only, when not editing) */}
                                        {!isEditing && item.status === 'pending' && (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="hidden md:block text-sm font-medium text-[#F34A23] hover:text-[#d63e1b] underline font-plus-jakarta-sans"
                                            >
                                                Edit Images
                                            </button>
                                        )}
                                    </div>

                                    {/* Images section */}
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {/* Desktop: horizontal row with ImageUploader */}
                                            <div className="hidden md:block">
                                                <ImageUploader
                                                    images={selectedImages}
                                                    onImagesChange={setSelectedImages}
                                                    maxImages={4}
                                                    labels={['Top view', 'Right view', 'Bottom view', 'Left view']}
                                                    loadingText="Uploading..."
                                                    aspectRatio="h-24 w-full"
                                                    instanceId={`edit-${item.id}`}
                                                />
                                            </div>

                                            {/* Mobile: 2x2 grid with ImageUploader */}
                                            <div className="md:hidden">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[0, 1, 2, 3].map((index) => (
                                                        <div key={index}>
                                                            <ImageUploader
                                                                images={[selectedImages[index]]}
                                                                onImagesChange={(newImages) => {
                                                                    const updated = [...selectedImages];
                                                                    updated[index] = newImages[0];
                                                                    setSelectedImages(updated);
                                                                }}
                                                                maxImages={1}
                                                                labels={[['Top view', 'Right view', 'Bottom view', 'Left view'][index]]}
                                                                loadingText="Uploading..."
                                                                aspectRatio="aspect-square"
                                                                instanceId={`edit-mobile-${item.id}-${index}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={updating}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <PrimaryButton
                                                    onClick={() => handleUpdate(item.id)}
                                                    disabled={updating || selectedImages.some(img => !img)}
                                                >
                                                    {updating ? 'Updating...' : 'Update Images'}
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    ) : images.length > 0 ? (
                                        <div className="w-full">
                                            {/* Desktop: horizontal row */}
                                            <div className="hidden md:flex gap-3">
                                                {images.slice(0, 4).map((imgUrl, index) => (
                                                    <div key={index} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${item.title} angle ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Mobile: 2x2 grid with edit button */}
                                            <div className="md:hidden space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {images.slice(0, 4).map((imgUrl, index) => (
                                                        <div key={index} className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                            <img
                                                                src={imgUrl}
                                                                alt={`${item.title} angle ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {item.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="w-full text-sm font-medium text-[#F34A23] hover:text-[#d63e1b] underline font-plus-jakarta-sans"
                                                    >
                                                        Edit Images
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
