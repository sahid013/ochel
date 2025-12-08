'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';
import { MenuEditorForm, MenuEditorFormData } from '@/components/menu/MenuEditorForm';
import { LoginSignupModal } from './LoginSignupModal';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';
import TextRotator from '@/components/ui/TextRotator';
import { Restaurant } from '@/types';

interface DemoMenuItem {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  image?: string;
  model3dGlbUrl?: string;
  model3dUsdzUrl?: string;
  images?: string[]; // Store filenames for display
}

const DEMO_CACHE_KEY = 'ochel_demo_menu_item';
const DEMO_TEMPLATE_KEY = 'ochel_demo_template';

// Mock restaurant object for template previews
const MOCK_RESTAURANT: Restaurant = {
  id: 'demo-restaurant',
  owner_id: 'demo-user',
  name: 'Your Restaurant',
  slug: 'demo',
  email: 'demo@example.com',
  phone: '0000000000',
  // primary_color: undefined, // Let template defaults take over
  is_active: true,
  template: 'template1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Demo Menu Editor - Allows users to try adding a menu item before signing up
 * Features:
 * - Add first menu item
 * - Select template to preview
 * - Prompt login/signup on second item attempt
 * - Cache first item in localStorage
 */
export function DemoMenuEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  const [showModal, setShowModal] = useState(false);
  const [demoItem, setDemoItem] = useState<DemoMenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load cached demo item on mount
  useEffect(() => {
    const cached = localStorage.getItem(DEMO_CACHE_KEY);
    const cachedTemplate = localStorage.getItem(DEMO_TEMPLATE_KEY);

    if (cached) {
      try {
        setDemoItem(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached demo item');
      }
    }

    if (cachedTemplate) {
      setSelectedTemplate(cachedTemplate);
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Form submission handler
  const handleFormSubmit = async (data: MenuEditorFormData) => {
    // If user already has an item, show login/signup modal
    if (demoItem && !isEditing) {
      setShowModal(true);
      return;
    }

    let imageBase64: string | undefined = undefined;

    // Handle preview image (Base64 conversion)
    if (data.previewImage && data.previewImage[0]) {
      const img = data.previewImage[0];
      if (typeof img === 'string') {
        imageBase64 = img; // Already base64 or URL
      } else if (img instanceof File) {
        try {
          imageBase64 = await fileToBase64(img);
        } catch (error) {
          console.error("Error converting file to base64", error);
        }
      }
    } else if (isEditing && demoItem?.image) {
      // Keep existing image if not changed (handled by initialValues logic usually)
      // If previewImage is empty/null, it means user removed it or it's new.
      // However, since we pass initialValues.previewImage = [demoItem.image],
      // if user didn't change it, it comes back as string.
      // If user removed it, it comes back as null.
      // So valid logic is above: if data.previewImage[0] exists, use it.
    }

    const newItem: DemoMenuItem = {
      id: demoItem?.id || Date.now().toString(), // Keep ID if editing
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      subcategory: data.subcategory,
      image: imageBase64,
      model3dGlbUrl: data.model3dGlbUrl?.trim() || undefined,
      model3dUsdzUrl: data.model3dUsdzUrl?.trim() || undefined,
      images: [], // We don't really store the 4 images in demo anymore as files are hard to persist
    };

    // Save to state and cache
    setDemoItem(newItem);
    localStorage.setItem(DEMO_CACHE_KEY, JSON.stringify(newItem));
    localStorage.setItem(DEMO_TEMPLATE_KEY, selectedTemplate);

    setIsEditing(false);

    // Smooth scroll to top to see result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    localStorage.setItem(DEMO_TEMPLATE_KEY, template);
  };

  const handleEdit = () => {
    if (demoItem) {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    setDemoItem(null);
    localStorage.removeItem(DEMO_CACHE_KEY);
    setIsEditing(false);
  };

  // Transform demoItem to initialValues
  const initialValues: Partial<MenuEditorFormData> | undefined = isEditing && demoItem ? {
    title: demoItem.title,
    description: demoItem.description,
    price: demoItem.price,
    category: demoItem.category,
    subcategory: demoItem.subcategory,
    model3dGlbUrl: demoItem.model3dGlbUrl,
    model3dUsdzUrl: demoItem.model3dUsdzUrl,
    previewImage: demoItem.image ? [demoItem.image] : [null], // string passes here
    selectedImages: [null, null, null, null]
  } : undefined;

  return (
    <div className="w-full max-w-[1460px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12 pt-[80px] px-5">
        <h2 className="text-xl md:text-[32px] font-bold text-primary mb-4 font-loubag uppercase flex flex-col md:flex-row items-center justify-center gap-2">
          <span>{t('home.demo.create')}</span>
          <TextRotator
            texts={[t('home.demo.rotator.menu'), t('home.demo.rotator.model')]}
            interval={3000}
            className="text-[#F34A23]"
          />
        </h2>
      </div>

      <div className="px-5 pb-12">
        <div className="grid gap-8 items-start grid-cols-1 md:grid-cols-[0.6fr_1fr]">
          {/* Left Column - Add Your First Item */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-primary mb-6 font-plus-jakarta-sans">
              {t('home.demo.addItem.title')}
            </h3>

            {demoItem && !isEditing ? (
              /* Display created item */
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-[#F34A23] text-white text-xs font-medium rounded-full">
                        {demoItem.category}
                      </span>
                      {demoItem.subcategory && (
                        <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded-full">
                          {demoItem.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleEdit}
                        className="p-1.5 text-gray-500 hover:text-[#F34A23] hover:bg-orange-50 rounded-full transition-colors"
                        title={t('home.demo.addItem.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title={t('home.demo.addItem.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      {t('home.demo.addItem.moreItems')}
                    </p>
                    <PrimaryButton onClick={() => setShowModal(true)} fullWidth>
                      {t('home.demo.addItem.continueSignup')}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ) : (
              /* Item Form Replaced */
              <MenuEditorForm
                initialValues={initialValues}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsEditing(false)}
                isEditing={isEditing}
                show3DInputs={true}
                showDetailedImageUpload={true}
                existingCategories={[]}
                existingSubcategories={[]}
              />
            )}
          </div>

          {/* Right Column - Choose Your Template */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border flex flex-col h-fit md:sticky md:top-[100px]" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-primary mb-6 font-plus-jakarta-sans">
              {t('home.demo.template.title')}
            </h3>

            {/* Template Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {['template1', 'template2', 'template3', 'template4'].map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateChange(template)}
                  className={`px-4 py-3 font-medium transition-all font-plus-jakarta-sans ${selectedTemplate === template
                    ? 'bg-[#F34A23] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  style={selectedTemplate === template ? {
                    borderRadius: '0.87413rem',
                    boxShadow: '0 0 34.366px 11.988px rgba(241, 155, 135, 0.50), 0 0.999px 2.997px 0 #FDD8C7 inset'
                  } : {
                    borderRadius: '0.5rem'
                  }}
                >
                  Template {template.slice(-1)}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden border-2" style={{ height: '600px', borderColor: 'rgba(71, 67, 67, 0.05)' }}>
              {/* Template 1 */}
              {selectedTemplate === 'template1' && (
                <div key="template1" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template1 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {/* Template 2 */}
              {selectedTemplate === 'template2' && (
                <div key="template2" className="h-full overflow-auto animate-fade-in bg-gray-100/50">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template2 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {/* Template 3 */}
              {selectedTemplate === 'template3' && (
                <div key="template3" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template3 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {/* Template 4 */}
              {selectedTemplate === 'template4' && (
                <div key="template4" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template4 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {demoItem && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('home.demo.template.itemAdded')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
      <LoginSignupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onNavigateToSignup={() => router.push('/signup')}
        onNavigateToLogin={() => router.push('/login')}
      />
    </div>
  );
}
