'use client';

import { useState, useEffect } from 'react';
import { LoginSignupModal } from './LoginSignupModal';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib';
import MenuItemCard from '@/components/menu/MenuItemCard';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';
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
  primary_color: '#000000',
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
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  const [showModal, setShowModal] = useState(false);
  const [demoItem, setDemoItem] = useState<DemoMenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [model3dGlbUrl, setModel3dGlbUrl] = useState('');
  const [model3dUsdzUrl, setModel3dUsdzUrl] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !category) {
      alert('Please fill in the title, category, and price');
      return;
    }

    // If user already has an item, show login/signup modal
    if (demoItem && !isEditing) {
      setShowModal(true);
      return;
    }

    const newItem: DemoMenuItem = {
      id: Date.now().toString(),
      title,
      description,
      price,
      category,
      subcategory,
      model3dGlbUrl: model3dGlbUrl.trim() || undefined,
      model3dUsdzUrl: model3dUsdzUrl.trim() || undefined,
    };

    // Save to state and cache
    setDemoItem(newItem);
    localStorage.setItem(DEMO_CACHE_KEY, JSON.stringify(newItem));
    localStorage.setItem(DEMO_TEMPLATE_KEY, selectedTemplate);

    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSubcategory('');
    setModel3dGlbUrl('');
    setModel3dUsdzUrl('');
    setIsEditing(false);
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    localStorage.setItem(DEMO_TEMPLATE_KEY, template);
  };

  const handleEdit = () => {
    if (demoItem) {
      setTitle(demoItem.title);
      setDescription(demoItem.description);
      setPrice(demoItem.price);
      setCategory(demoItem.category);
      setSubcategory(demoItem.subcategory);
      setModel3dGlbUrl(demoItem.model3dGlbUrl || '');
      setModel3dUsdzUrl(demoItem.model3dUsdzUrl || '');
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    setDemoItem(null);
    localStorage.removeItem(DEMO_CACHE_KEY);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSubcategory('');
    setModel3dGlbUrl('');
    setModel3dUsdzUrl('');
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12 pt-[100px] px-5">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-loubag uppercase">
          Try It Out
        </h2>
      </div>

      <div className="px-5 pb-12">
        <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '0.6fr 1fr' }}>
          {/* Left Column - Add Your First Item */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-loubag uppercase">
              Add Your First Item
            </h3>

            {demoItem && !isEditing ? (
              /* Display created item */
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-[#F34A23] text-white text-xs font-medium rounded-full mb-2">
                      {demoItem.category}
                    </span>
                    {demoItem.subcategory && (
                      <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded-full mb-2 ml-2">
                        {demoItem.subcategory}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-semibold text-gray-900">{demoItem.title}</h4>
                    <span className="text-lg font-bold text-[#F34A23]">{demoItem.price}€</span>
                  </div>
                  {demoItem.description && (
                    <p className="text-gray-600">{demoItem.description}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 border-2 border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Want to add more items?
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full px-6 py-3 bg-[#F34A23] text-white font-semibold rounded-lg hover:bg-[#d63d1a] transition-colors"
                  >
                    Continue with Sign Up
                  </button>
                </div>
              </div>
            ) : (
              /* Item Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Category <span className="text-red-500">*</span>
                    <div className="group relative">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        <p className="font-semibold mb-1">What is a Category?</p>
                        <p>Categories are main sections of your menu (e.g., "Main Dishes", "Appetizers", "Desserts"). They help organize your menu items.</p>
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Main Dishes"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Subcategory
                    <div className="group relative">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        <p className="font-semibold mb-1">What is a Subcategory?</p>
                        <p>Subcategories are optional subsections within a category (e.g., "Pizza" or "Pasta" under "Main Dishes"). They provide extra organization.</p>
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g., Pizza (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Margherita Pizza"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Fresh mozzarella, tomato sauce, and basil"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="12.50"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      €
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3D Model URL (GLB - Android/Web)
                  </label>
                  <input
                    type="url"
                    value={model3dGlbUrl}
                    onChange={(e) => setModel3dGlbUrl(e.target.value)}
                    placeholder="https://example.com/model.glb"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: GLB format for 3D preview on web and Android
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3D Model URL (USDZ - iOS AR)
                  </label>
                  <input
                    type="url"
                    value={model3dUsdzUrl}
                    onChange={(e) => setModel3dUsdzUrl(e.target.value)}
                    placeholder="https://example.com/model.usdz"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: USDZ format for iOS AR Quick Look
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#F34A23] text-white font-semibold rounded-lg hover:bg-[#d63d1a] transition-colors"
                >
                  {isEditing ? 'Update Item' : 'Add to Menu'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setTitle('');
                      setDescription('');
                      setPrice('');
                      setCategory('');
                      setSubcategory('');
                      setModel3dGlbUrl('');
                      setModel3dUsdzUrl('');
                    }}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Right Column - Choose Your Template */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border flex flex-col h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-loubag uppercase">
              Choose Your Template
            </h3>

            {/* Template Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['template1', 'template2', 'template3', 'template4'].map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateChange(template)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedTemplate === template
                    ? 'bg-[#F34A23] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Template {template.slice(-1)}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden border-2" style={{ height: '600px', borderColor: 'rgba(71, 67, 67, 0.05)' }}>
              {/* Template 1 */}
              {selectedTemplate === 'template1' && (
                <div className="h-full overflow-auto">
                  <Template1 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                </div>
              )}

              {/* Template 2 */}
              {selectedTemplate === 'template2' && (
                <div className="h-full overflow-auto">
                  <Template2 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                </div>
              )}

              {/* Template 3 */}
              {selectedTemplate === 'template3' && (
                <div className="h-full overflow-auto">
                  <Template3 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                </div>
              )}

              {/* Template 4 */}
              {selectedTemplate === 'template4' && (
                <div className="h-full overflow-auto">
                  <Template4 restaurant={MOCK_RESTAURANT} demoItem={demoItem} />
                </div>
              )}

              {/* Preview Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between text-white/90 text-xs">
                  <span className="font-medium">Live Preview</span>
                  <span className="bg-white/20 px-2 py-1 rounded">
                    {selectedTemplate === 'template1' && 'Classic Dark'}
                    {selectedTemplate === 'template2' && 'Modern Sidebar'}
                    {selectedTemplate === 'template3' && 'Elegant Gold'}
                    {selectedTemplate === 'template4' && 'Modern Minimalist'}
                  </span>
                </div>
              </div>

              {demoItem && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your Item Added
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
