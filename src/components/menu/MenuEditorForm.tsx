'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { PrimaryButton } from '@/components/ui';
import { ImageUploader } from '@/components/demo/ImageUploader';

const SAMPLE_GLB_URL = 'https://plats.ochel.fr/le-chalet/glb/pave_de_boeuf.glb';
const SAMPLE_USDZ_URL = 'https://plats.ochel.fr/le-chalet/usdz/pave_de_boeuf.usdz';

export interface MenuEditorFormData {
    title: string;
    description: string;
    price: string;
    category: string;
    subcategory: string;
    previewImage?: (File | string | null)[];
    selectedImages?: (File | string | null)[];
    model3dGlbUrl?: string;
    model3dUsdzUrl?: string;
}

interface MenuEditorFormProps {
    initialValues?: Partial<MenuEditorFormData>;
    onSubmit: (data: MenuEditorFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    submitLabel?: string;
    isEditing?: boolean;
    show3DInputs?: boolean;
    showDetailedImageUpload?: boolean;
    existingCategories?: string[];
    existingSubcategories?: string[];
}

export function MenuEditorForm({
    initialValues,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    isEditing = false,
    show3DInputs = false,
    showDetailedImageUpload = true,
    existingCategories = [],
    existingSubcategories = []
}: MenuEditorFormProps) {
    const { t } = useTranslation();

    // Form State
    const [title, setTitle] = useState(initialValues?.title || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [price, setPrice] = useState(initialValues?.price || '');
    const [category, setCategory] = useState(initialValues?.category || '');
    const [subcategory, setSubcategory] = useState(initialValues?.subcategory || '');
    const [model3dGlbUrl, setModel3dGlbUrl] = useState(initialValues?.model3dGlbUrl || '');
    const [model3dUsdzUrl, setModel3dUsdzUrl] = useState(initialValues?.model3dUsdzUrl || '');

    // Image State
    const [previewImage, setPreviewImage] = useState<(File | string | null)[]>(
        initialValues?.previewImage || [null]
    );
    const [selectedImages, setSelectedImages] = useState<(File | string | null)[]>(
        initialValues?.selectedImages || [null, null, null, null]
    );

    const [copiedLink, setCopiedLink] = useState<'glb' | 'usdz' | null>(null);

    // Update state when initialValues change (e.g. when editing a different item)
    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title || '');
            setDescription(initialValues.description || '');
            setPrice(initialValues.price || '');
            setCategory(initialValues.category || '');
            setSubcategory(initialValues.subcategory || '');
            setModel3dGlbUrl(initialValues.model3dGlbUrl || '');
            setModel3dUsdzUrl(initialValues.model3dUsdzUrl || '');
            // Note: We typically don't reset images from initialValues unless they are File objects, 
            // which persist. If they are URLs, this component needs logic to handle initial URLs vs Files.
            // For now, assuming parent handles passing Files or we start empty.
            if (initialValues.previewImage) setPreviewImage(initialValues.previewImage);
            if (initialValues.selectedImages) setSelectedImages(initialValues.selectedImages);
        }
    }, [initialValues]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            price,
            category,
            subcategory,
            model3dGlbUrl,
            model3dUsdzUrl,
            previewImage,
            selectedImages
        });
    };

    const handleCopySample = (url: string, type: 'glb' | 'usdz', e: React.MouseEvent) => {
        e.preventDefault(); // Prevent label activation
        navigator.clipboard.writeText(url);
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    // Filter categories based on input
    const filteredCategories = category.trim() === '' ? [] : existingCategories
        .filter(c => c.toLowerCase().includes(category.toLowerCase()))
        .slice(0, 5); // Show top 5

    // Filter subcategories based on input
    const filteredSubcategories = subcategory.trim() === '' ? [] : existingSubcategories
        .filter(s => s.toLowerCase().includes(subcategory.toLowerCase()))
        .slice(0, 5); // Show top 5

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        {t('home.demo.addItem.category')} <span className="text-red-500">*</span>
                        <div className="group relative">
                            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white text-gray-700 text-xs rounded-lg shadow-lg border border-gray-200 z-10">
                                <p className="font-semibold mb-1 text-gray-900">{t('home.demo.addItem.categoryHelpTitle')}</p>
                                <p>{t('home.demo.addItem.categoryHelpText')}</p>
                                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    </label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder={t('home.demo.addItem.categoryPlaceholder')}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                        required
                    />
                    {/* Category Dropdown */}
                    {filteredCategories.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredCategories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        {t('home.demo.addItem.subcategory')}
                        <div className="group relative">
                            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white text-gray-700 text-xs rounded-lg shadow-lg border border-gray-200 z-10">
                                <p className="font-semibold mb-1 text-gray-900">{t('home.demo.addItem.subcategoryHelpTitle')}</p>
                                <p>{t('home.demo.addItem.subcategoryHelpText')}</p>
                                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    </label>
                    <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder={t('home.demo.addItem.subcategoryPlaceholder')}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                    />
                    {/* Subcategory Dropdown */}
                    {filteredSubcategories.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredSubcategories.map((sub, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSubcategory(sub)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.demo.addItem.itemName')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('home.demo.addItem.itemNamePlaceholder')}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                    required
                />
            </div>

            {/* Menu Preview Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.demo.addItem.previewImage.title')}
                </label>
                <ImageUploader
                    images={previewImage}
                    onImagesChange={setPreviewImage}
                    maxImages={1}
                    loadingText={t('home.demo.addItem.previewImage.uploading')}
                    placeholderText={t('home.demo.addItem.previewImage.placeholder')}
                    aspectRatio="h-48 w-full"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.demo.addItem.description')}
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('home.demo.addItem.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] resize-none text-primary placeholder:text-gray-400"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.demo.addItem.price')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={t('home.demo.addItem.pricePlaceholder')}
                        className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                        required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        €
                    </span>
                </div>
            </div>

            {/* 3D Model Fields - Conditional */}
            {show3DInputs && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            {t('home.demo.addItem.modelGlb') || '3D Model URL'}
                            <div className="group relative">
                                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white text-gray-700 text-xs rounded-lg shadow-lg border border-gray-200 z-10">
                                    <p className="font-semibold mb-1 text-gray-900">{t('home.demo.addItem.modelGlbHelpTitle')}</p>
                                    <p>{t('home.demo.addItem.modelGlbHelpText')}</p>
                                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => handleCopySample(SAMPLE_GLB_URL, 'glb', e)}
                                className={`ml-auto text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-md transition-colors ${copiedLink === 'glb'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-50 text-[#F34A23] hover:text-[#d63e1b]'
                                    }`}
                            >
                                {copiedLink === 'glb' ? (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lien copié !
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Copier lien exemple
                                    </>
                                )}
                            </button>
                        </label>
                        <input
                            type="url"
                            value={model3dGlbUrl}
                            onChange={(e) => setModel3dGlbUrl(e.target.value)}
                            placeholder={t('home.demo.addItem.modelGlbPlaceholder') || 'https://example.com/model.glb'}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                            style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            {t('home.demo.addItem.modelUsdz') || '3D Model URL'}
                            <div className="group relative">
                                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white text-gray-700 text-xs rounded-lg shadow-lg border border-gray-200 z-10">
                                    <p className="font-semibold mb-1 text-gray-900">{t('home.demo.addItem.modelUsdzHelpTitle')}</p>
                                    <p>{t('home.demo.addItem.modelUsdzHelpText')}</p>
                                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => handleCopySample(SAMPLE_USDZ_URL, 'usdz', e)}
                                className={`ml-auto text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-md transition-colors ${copiedLink === 'usdz'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-50 text-[#F34A23] hover:text-[#d63e1b]'
                                    }`}
                            >
                                {copiedLink === 'usdz' ? (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lien copié !
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Copier lien exemple
                                    </>
                                )}
                            </button>
                        </label>
                        <input
                            type="url"
                            value={model3dUsdzUrl}
                            onChange={(e) => setModel3dUsdzUrl(e.target.value)}
                            placeholder={t('home.demo.addItem.modelUsdzPlaceholder') || 'https://example.com/model.usdz'}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                            style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                        />
                    </div>
                </>
            )}

            {/* Detailed Image Upload Section - Conditional */}
            {showDetailedImageUpload && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('home.demo.addItem.images.title')}
                    </label>
                    <ImageUploader
                        images={selectedImages}
                        onImagesChange={setSelectedImages}
                        maxImages={4}
                        labels={[
                            t('home.demo.addItem.images.views.top'),
                            t('home.demo.addItem.images.views.right'),
                            t('home.demo.addItem.images.views.bottom'),
                            t('home.demo.addItem.images.views.left')
                        ]}
                        loadingText={t('home.demo.addItem.images.uploading')}
                        aspectRatio="h-32 w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {t('home.demo.addItem.images.info')}
                    </p>
                </div>
            )}

            <PrimaryButton type="submit" fullWidth disabled={isLoading}>
                {submitLabel || (isEditing ? t('home.demo.addItem.update') : t('home.demo.addItem.submit'))}
            </PrimaryButton>

            {isEditing && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                    {t('home.demo.addItem.cancel')}
                </button>
            )}
        </form>
    );
}
