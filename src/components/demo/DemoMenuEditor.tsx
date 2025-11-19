'use client';

import { useState, useEffect } from 'react';
import { LoginSignupModal } from './LoginSignupModal';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib';
import MenuItemCard from '@/components/menu/MenuItemCard';

interface DemoMenuItem {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  image?: string;
}

const DEMO_CACHE_KEY = 'ochel_demo_menu_item';
const DEMO_TEMPLATE_KEY = 'ochel_demo_template';

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
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12 pt-[120px] px-5">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Try It Out
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create your first menu item and see it come to life instantly. No signup required to start!
        </p>
      </div>

      <div className="px-5 pb-12">
        <div className="grid gap-8" style={{ gridTemplateColumns: '0.6fr 1fr' }}>
        {/* Left Column - Add Your First Item */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
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
                  Want to add more items? Create a free account!
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
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Choose Your Template
          </h3>

          {/* Template Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['template1', 'template2', 'template3', 'template4'].map((template) => (
              <button
                key={template}
                onClick={() => handleTemplateChange(template)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedTemplate === template
                    ? 'bg-[#F34A23] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Template {template.slice(-1)}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-gray-800" style={{ height: '520px' }}>
            {/* Template 1: Classic Dark */}
            {selectedTemplate === 'template1' && (
              <div className="h-full bg-[#000000] text-white overflow-hidden rounded-lg">
                <div className="bg-gradient-to-b from-gray-900 to-black p-6 text-center border-b border-white/10">
                  <h2 className="text-2xl font-bold font-forum mb-1">NOTRE MENU</h2>
                  <p className="text-sm text-[#FFD65A]">Your Restaurant</p>
                </div>
                <div className="p-4">
                  {demoItem ? (
                    <>
                      {/* Category Tabs */}
                      <div className="bg-[#101010] border border-white/30 rounded-[8px] p-[6px] mb-6">
                        <div className="flex gap-1">
                          <button className="text-[14px] text-center rounded-[6px] py-2 px-4 min-h-[40px] flex items-center justify-center whitespace-nowrap flex-shrink-0 text-[#FFD65A] bg-[#FFD65A]/10">
                            {demoItem.category}
                          </button>
                        </div>
                      </div>

                      {/* Subcategory Heading (if provided) */}
                      {demoItem.subcategory && (
                        <div className="mb-4">
                          <h3 className="text-[24px] font-forum text-[#FFF2CC] font-medium capitalize">
                            {demoItem.subcategory}
                          </h3>
                        </div>
                      )}

                      {/* Menu Item - Using Real Component */}
                      <MenuItemCard
                        title={demoItem.title}
                        subtitle={demoItem.description}
                        price={`${demoItem.price} €`}
                        variant="regular"
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-white/50">
                      <p className="text-sm">Add your first menu item to see it here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template 2: Modern Sidebar */}
            {selectedTemplate === 'template2' && (
              <div className="h-full bg-[#000000] text-white overflow-hidden rounded-lg flex">
                <div className="w-24 bg-black/50 border-r border-white/20 p-2">
                  <button className="w-full py-3 bg-[#F34A23] text-white rounded text-xs">Main</button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="bg-gradient-to-b from-gray-900 to-black p-4 text-center border-b border-white/10">
                    <h2 className="text-xl font-bold">Your Restaurant</h2>
                  </div>
                  <div className="p-3">
                    {demoItem ? (
                      <>
                        {/* Category shown in sidebar (active) */}
                        {/* Subcategory Heading (if provided) */}
                        {demoItem.subcategory && (
                          <div className="mb-3">
                            <h3 className="text-[20px] font-forum text-[#FFF2CC] font-medium capitalize">
                              {demoItem.subcategory}
                            </h3>
                          </div>
                        )}
                        {/* Menu Item - Using Real Component */}
                        <MenuItemCard
                          title={demoItem.title}
                          subtitle={demoItem.description}
                          price={`${demoItem.price} €`}
                          variant="regular"
                        />
                      </>
                    ) : (
                      <div className="text-center py-12 text-white/50">
                        <p className="text-sm">Add your first menu item to see it here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template 3: Elegant Gold */}
            {selectedTemplate === 'template3' && (
              <div className="h-full bg-gradient-to-b from-[#1a1a1a] to-[#000000] text-white overflow-hidden rounded-lg">
                <div className="p-6 text-center border-b border-[#D4AF37]/30">
                  <h2 className="text-2xl font-bold font-serif mb-1 text-[#D4AF37]">Your Restaurant</h2>
                  <p className="text-sm text-white/60">Fine Dining</p>
                </div>
                <div className="p-4">
                  {demoItem ? (
                    <>
                      {/* Category badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium rounded border border-[#D4AF37]/30">
                          {demoItem.category}
                        </span>
                      </div>
                      {/* Subcategory Heading (if provided) */}
                      {demoItem.subcategory && (
                        <div className="mb-4">
                          <h3 className="text-[24px] font-serif font-semibold text-[#D4AF37]">
                            {demoItem.subcategory}
                          </h3>
                        </div>
                      )}
                      {/* Menu Item - Using Real Component */}
                      <MenuItemCard
                        title={demoItem.title}
                        subtitle={demoItem.description}
                        price={`${demoItem.price} €`}
                        variant="regular"
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-white/50">
                      <p className="text-sm">Add your first menu item to see it here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template 4: Modern Minimalist */}
            {selectedTemplate === 'template4' && (
              <div className="h-full bg-[#000000] text-white overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-[#F34A23] to-[#d63d1a] p-6 text-center">
                  <h2 className="text-2xl font-bold mb-1">Your Restaurant</h2>
                  <p className="text-sm text-white/90">Modern Cuisine</p>
                </div>
                <div className="p-4">
                  {demoItem ? (
                    <>
                      {/* Category and Subcategory badges */}
                      <div className="mb-3 flex gap-2 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-[#F34A23] text-white text-sm font-medium rounded">
                          {demoItem.category}
                        </span>
                        {demoItem.subcategory && (
                          <span className="inline-block px-3 py-1 bg-white/10 text-white/70 text-sm font-medium rounded">
                            {demoItem.subcategory}
                          </span>
                        )}
                      </div>
                      {/* Menu Item - Using Real Component */}
                      <MenuItemCard
                        title={demoItem.title}
                        subtitle={demoItem.description}
                        price={`${demoItem.price} €`}
                        variant="regular"
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-white/50">
                      <p className="text-sm">Add your first menu item to see it here</p>
                    </div>
                  )}
                </div>
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
