'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { PrimaryButton, Button } from '@/components/ui';
import { ImageUploader } from '@/components/demo/ImageUploader';
import { Alert } from '@/components/ui/Alert';
import { QRCodeSection } from '@/components/qr';

interface SettingsTabProps {
    restaurant: Restaurant;
    slug: string;
}

export function SettingsTab({ restaurant, slug }: SettingsTabProps) {
    const [loading, setLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Local state for image display (string URL or null)
    const [currentLogo, setCurrentLogo] = useState<string | null>(restaurant.logo_url || null);

    const [formData, setFormData] = useState({
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        phone: restaurant.phone || '',
        primary_color: restaurant.primary_color || '',
        accent_color: restaurant.accent_color || '',
    });

    const uploadLogo = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${restaurant.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('brand-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('brand-assets')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    };

    const handleImageChange = async (images: (File | string | null)[]) => {
        const newImage = images[0];

        // If image removed
        if (!newImage) {
            setCurrentLogo(null);
            return;
        }

        // If it's a file, we need to upload it
        if (newImage instanceof File) {
            try {
                setLoading(true);
                const publicUrl = await uploadLogo(newImage);
                setCurrentLogo(publicUrl);

                const { error: updateError } = await supabase
                    .from('restaurants')
                    .update({ logo_url: publicUrl })
                    .eq('id', restaurant.id);

                if (updateError) throw updateError;


            } catch (err) {
                setError('Failed to upload logo');
            } finally {
                setLoading(false);
            }
        }
    };

    const { t } = useTranslation();
    const handleCancelSubscription = async () => {
        setCancelLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorCode = errorData.errorCode;

                // Map error codes to translations
                const errorMap: Record<string, string> = {
                    'TEST_MODE_DATA': t('admin.settings.errors.testModeData'),
                    'NO_CUSTOMER': t('admin.settings.errors.noCustomer'),
                    'NO_RESTAURANT': t('admin.settings.errors.noRestaurant'),
                    'GENERIC_ERROR': t('admin.settings.errors.generic'),
                };

                throw new Error(errorMap[errorCode] || t('admin.settings.errors.generic'));
            }

            const { url } = await response.json();
            window.location.href = url;

        } catch (err: any) {
            console.error('Portal error:', err);
            setError(err.message || t('admin.settings.errors.generic'));
        } finally {
            setCancelLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { error: updateError } = await supabase
                .from('restaurants')
                .update({
                    name: formData.name,
                    slug: formData.slug,
                    phone: formData.phone,
                    primary_color: formData.primary_color,
                    accent_color: formData.accent_color,
                })
                .eq('id', restaurant.id);

            if (updateError) throw updateError;
            setSuccess(t('admin.settings.success'));

        } catch (err) {
            console.error('Error updating settings:', err);
            setError(t('admin.settings.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('admin.settings.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('admin.settings.subtitle')}</p>
                </div>
            </div>

            {success && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                    {success}
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="mb-6">
                    {error}
                </Alert>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Column - Profile Image */}
                        <div className="lg:col-span-1 border-r border-gray-100 pr-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.settings.profileImage.title')}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {t('admin.settings.profileImage.description')}
                            </p>

                            <div className="flex flex-col items-center">
                                <div className="w-full max-w-[280px] aspect-square mb-6">
                                    {/* Using ImageUploader with correct props */}
                                    <ImageUploader
                                        images={[currentLogo]}
                                        onImagesChange={handleImageChange}
                                        maxImages={1}
                                        loadingText={t('admin.settings.saving')}
                                        placeholderText={t('admin.branding.logo.placeholder') || "Upload Logo"}
                                        className="w-full h-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 text-center whitespace-pre-line">
                                    {t('admin.settings.profileImage.recommended')}
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Basic Options */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.settings.basicInfo.title')}</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            {t('admin.settings.basicInfo.name')}
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                                            style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                            placeholder="ex: La Bella Vita"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="slug" className="text-sm font-medium text-gray-700">
                                            {t('admin.settings.basicInfo.slug')}
                                        </label>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 text-sm mr-2">ochel.com/</span>
                                            <input
                                                id="slug"
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                                                style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                        {t('admin.settings.basicInfo.phone')}
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="primary_color" className="text-sm font-medium text-gray-700">
                                            {t('admin.settings.basicInfo.primaryColor')}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: formData.primary_color || '#000000' }}></div>
                                            <input
                                                id="primary_color"
                                                type="text"
                                                value={formData.primary_color}
                                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                                                style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="accent_color" className="text-sm font-medium text-gray-700">
                                            {t('admin.settings.basicInfo.accentColor')}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: formData.accent_color || '#ffffff' }}></div>
                                            <input
                                                id="accent_color"
                                                type="text"
                                                value={formData.accent_color}
                                                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                                                style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Management Section */}
                                {(restaurant.subscription_status === 'active' || restaurant.subscription_status === 'trialing') && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('admin.settings.subscription.title')}</h4>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {t('admin.settings.subscription.description')}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelSubscription}
                                            disabled={cancelLoading || loading}
                                            className="!border-2 !border-gray-900/20 !text-gray-900"
                                        >
                                            {cancelLoading ? t('admin.settings.saving') : t('admin.settings.subscription.button')}
                                        </Button>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={loading || cancelLoading}
                                        className="min-w-[120px]"
                                    >
                                        {loading ? t('admin.settings.saving') : t('admin.settings.save')}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    <QRCodeSection restaurant={restaurant} />
                </div>
            </div>
        </div>
    );
}
