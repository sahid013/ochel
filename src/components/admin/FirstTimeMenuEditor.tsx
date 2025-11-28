'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { PrimaryButton } from '@/components/ui';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category_id: number;
  subcategory_id: number;
  model_3d_url?: string | null;
  redirect_3d_url?: string | null;
}

interface FirstTimeMenuEditorProps {
  restaurant: Restaurant;
  onPublish?: () => void;
}

/**
 * First-time menu editor for authenticated users
 * Fetches menu items from database and allows adding more before publishing
 */
export function FirstTimeMenuEditor({ restaurant }: FirstTimeMenuEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(restaurant.template || 'template1');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [model3dGlbUrl, setModel3dGlbUrl] = useState('');
  const [model3dUsdzUrl, setModel3dUsdzUrl] = useState('');

  // Fetch existing menu items from database
  useEffect(() => {
    fetchMenuItems();
  }, [restaurant.id]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !category) {
      alert('Please fill in the title, category, and price');
      return;
    }

    try {
      setLoading(true);

      // Create or get category
      let categoryData = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('title', category)
        .maybeSingle();

      if (!categoryData.data) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            restaurant_id: restaurant.id,
            title: category,
            title_en: category,
            order: 0,
            status: 'active'
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        categoryData.data = newCategory;
      }

      // Create or get subcategory
      let subcategoryData = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.data.id)
        .eq('title', subcategory || 'General')
        .maybeSingle();

      if (!subcategoryData.data) {
        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('subcategories')
          .insert({
            restaurant_id: restaurant.id,
            category_id: categoryData.data.id,
            title: subcategory || 'General',
            title_en: subcategory || 'General',
            order: 0,
            status: 'active'
          })
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;
        subcategoryData.data = newSubcategory;
      }

      // Create menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurant.id,
          category_id: categoryData.data.id,
          subcategory_id: subcategoryData.data.id,
          title: title,
          title_en: title,
          description: description || '',
          description_en: description || '',
          price: parseFloat(price) || 0,
          image_path: null,
          model_3d_url: model3dGlbUrl.trim() || null,
          redirect_3d_url: model3dUsdzUrl.trim() || null,
          order: 0,
          status: 'active'
        });

      if (itemError) throw itemError;

      // Refresh menu items
      await fetchMenuItems();

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSubcategory('');
      setModel3dGlbUrl('');
      setModel3dUsdzUrl('');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error creating menu item:', err);
      alert(`Failed to create menu item: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (template: string) => {
    setSelectedTemplate(template);

    // Save template to database
    try {
      await supabase
        .from('restaurants')
        .update({ template })
        .eq('id', restaurant.id);
    } catch (err) {
      console.error('Error updating template:', err);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)
        .eq('restaurant_id', restaurant.id);

      if (error) throw error;

      // Refresh menu items
      await fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  // Convert database items to demo format for template preview
  // If no items exist, show a placeholder sample item
  const demoItem = menuItems.length > 0 ? {
    id: menuItems[0].id.toString(),
    title: menuItems[0].title,
    description: menuItems[0].description,
    price: menuItems[0].price.toString(),
    category: 'Your Menu',
    subcategory: '',
    model3dGlbUrl: menuItems[0].model_3d_url || undefined,
    model3dUsdzUrl: menuItems[0].redirect_3d_url || undefined,
  } : {
    id: 'sample',
    title: 'Sample Menu Item',
    description: 'This is how your menu items will appear. Add your first item to see it here!',
    price: '12.50',
    category: 'Preview',
    subcategory: '',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12 px-5">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-loubag uppercase">
          Create your <span className="text-[#F34A23]">Menu Items</span>
        </h2>
        <p className="text-secondary text-lg font-inter">
          {menuItems.length > 0
            ? `You have ${menuItems.length} item${menuItems.length > 1 ? 's' : ''}. Add more or click "Publish your menu" to go live!`
            : 'Start building your menu by adding your first item'
          }
        </p>
      </div>

      <div className="px-5 pb-12">
        <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '0.6fr 1fr' }}>
          {/* Left Column - Add Items */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-primary mb-6 font-plus-jakarta-sans">
              {menuItems.length > 0 ? 'Add More Items' : 'Add Your First Item'}
            </h3>

            {/* Display existing items */}
            {menuItems.length > 0 && (
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-primary">{item.title}</h4>
                        <span className="text-md font-bold text-[#F34A23]">{item.price}€</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="ml-3 text-red-600 hover:text-red-800"
                      title="Delete item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Item Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
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
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                  />
                </div>
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
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
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
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] resize-none text-primary placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
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
                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                    style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
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
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
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
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400"
                  style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: USDZ format for iOS AR Quick Look
                </p>
              </div>

              <PrimaryButton type="submit" disabled={loading} fullWidth>
                {loading ? 'Adding...' : 'Add Item'}
              </PrimaryButton>
            </form>
          </div>

          {/* Right Column - Choose Your Template */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border flex flex-col h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl font-bold text-primary mb-6 font-plus-jakarta-sans">
              Choose Your Template
            </h3>

            {/* Template Selector */}
            <div className="grid grid-cols-4 gap-3 mb-6">
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
                <div className="h-full overflow-auto">
                  <Template1 restaurant={restaurant} demoItem={demoItem} />
                </div>
              )}

              {/* Template 2 */}
              {selectedTemplate === 'template2' && (
                <div className="h-full overflow-auto">
                  <Template2 restaurant={restaurant} demoItem={demoItem} />
                </div>
              )}

              {/* Template 3 */}
              {selectedTemplate === 'template3' && (
                <div className="h-full overflow-auto">
                  <Template3 restaurant={restaurant} demoItem={demoItem} />
                </div>
              )}

              {/* Template 4 */}
              {selectedTemplate === 'template4' && (
                <div className="h-full overflow-auto">
                  <Template4 restaurant={restaurant} demoItem={demoItem} />
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

              {menuItems.length > 0 && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 bg-green-500 text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {menuItems.length} Item{menuItems.length > 1 ? 's' : ''} Added
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
