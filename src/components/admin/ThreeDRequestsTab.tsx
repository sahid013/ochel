'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

                        return (
                            <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

                                    {/* Right side - Images (desktop: 1 row, mobile: 2x2 below) */}
                                    {images.length > 0 && (
                                        <div className="w-full md:w-auto">
                                            {/* Desktop: horizontal row */}
                                            <div className="hidden md:flex gap-2">
                                                {images.slice(0, 4).map((imgUrl, index) => (
                                                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${item.title} angle ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Mobile: 2x2 grid */}
                                            <div className="grid grid-cols-2 gap-2 md:hidden">
                                                {images.slice(0, 4).map((imgUrl, index) => (
                                                    <div key={index} className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${item.title} angle ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
