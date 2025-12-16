'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PrimaryButton } from '@/components/ui';
import { ImageUploader } from '@/components/demo/ImageUploader';
import { uploadImage } from '@/lib/storage';

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
    const [editingItem, setEditingItem] = useState<RequestItem | null>(null);
    const [selectedImages, setSelectedImages] = useState<(File | string | null)[]>([null, null, null, null]);
    const [uploading, setUploading] = useState(false);

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

    const handleEditClick = (item: RequestItem) => {
        setEditingItem(item);
        try {
            const images = item.additional_image_url ? JSON.parse(item.additional_image_url) : [null, null, null, null];
            // Fill up to 4 items
            while (images.length < 4) images.push(null);
            setSelectedImages(images);
        } catch (e) {
            setSelectedImages([null, null, null, null]);
        }
    };

    const handleImageChange = (index: number, file: File | null) => {
        const newImages = [...selectedImages];
        newImages[index] = file;
        setSelectedImages(newImages);
    };

    const handleUpdateImages = async () => {
        if (!editingItem) return;

        try {
            setUploading(true);
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
                .eq('id', editingItem.id);

            if (error) throw error;

            await fetchRequests();
            setEditingItem(null);
            setSelectedImages([null, null, null, null]);
        } catch (err) {
            console.error('Error updating images:', err);
            alert('Failed to update images. Please try again.');
        } finally {
            setUploading(false);
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
                    {requests.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
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

                            {item.status === 'pending' && (
                                <button
                                    onClick={() => handleEditClick(item)}
                                    className="text-sm font-medium text-[#F34A23] hover:text-[#d63e1b] underline font-plus-jakarta-sans"
                                >
                                    View / Update Images
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-xl font-bold mb-4 font-loubag">Update Images for "{editingItem.title}"</h3>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4 font-plus-jakarta-sans">
                                Upload 4 high-quality images of your dish from different angles.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <span className="text-xs font-medium text-gray-500 text-center">Angle {index + 1}</span>
                                        <ImageUploader
                                            images={[selectedImages[index]]}
                                            onImagesChange={(newImages) => handleImageChange(index, newImages[0] as File | null)}
                                            maxImages={1}
                                            loadingText="Uploading..."
                                            className="h-32"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <PrimaryButton
                                onClick={handleUpdateImages}
                                disabled={uploading || selectedImages.some(img => !img)}
                            >
                                {uploading ? 'Updating...' : 'Update Images'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
