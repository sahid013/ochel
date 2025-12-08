'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { MenuEditorForm, MenuEditorFormData } from '@/components/menu/MenuEditorForm';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';
import { uploadImage } from '@/lib/storage';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: number;
  subcategory_id: number;
  model_3d_url?: string | null;
  redirect_3d_url?: string | null;
}

interface FirstTimeMenuEditorProps {
  restaurant: Restaurant;
  onPublish?: () => void;
  onTemplateChange?: (template: string) => void;
}

/**
 * First-time menu editor for authenticated users
 * Fetches menu items from database and allows adding more before publishing
 */
export function FirstTimeMenuEditor({ restaurant, onTemplateChange }: FirstTimeMenuEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(restaurant.template || 'template1');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  // Key to force reset form after successful submission
  const [formKey, setFormKey] = useState(0);
  const [showItemsModal, setShowItemsModal] = useState(false);

  // Fetch existing categories and subcategories for autocomplete
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  const fetchTaxonomy = async () => {
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('title')
        .eq('restaurant_id', restaurant.id);

      const { data: subData } = await supabase
        .from('subcategories')
        .select('title')
        .eq('restaurant_id', restaurant.id);

      if (catData) {
        const uniqueCats = Array.from(new Set(catData.map(c => c.title)));
        setCategories(uniqueCats);
      }
      if (subData) {
        const uniqueSubs = Array.from(new Set(subData.map(s => s.title)));
        setSubcategories(uniqueSubs);
      }
    } catch (err) {
      console.error('Error fetching taxonomy:', err);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, [restaurant.id]);

  // Helper to convert Base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

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

  const migrateDemoItem = async () => {
    // Prevent concurrent migrations
    if (isMigrating) return;

    const DEMO_KEY = 'ochel_demo_menu_item';
    const FIRST_TIME_KEY = 'ochel_first_time_menu_item';

    let cached = localStorage.getItem(DEMO_KEY);
    let usedKey = DEMO_KEY;

    // Fallback to first_time key (set by login/signup pages)
    if (!cached) {
      cached = localStorage.getItem(FIRST_TIME_KEY);
      usedKey = FIRST_TIME_KEY;
    }

    console.log('Migration check - Cached item:', cached ? `Found in ${usedKey}` : 'Not found');

    if (!cached) {
      // If manually triggered and no item, alert user
      return false;
    }

    try {
      console.log('Starting migration...');
      setIsMigrating(true);
      const demoItem = JSON.parse(cached);
      console.log('Parsed demo item:', demoItem);

      // Create or get category
      let categoryData = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('title', demoItem.category)
        .maybeSingle();

      if (!categoryData.data) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            restaurant_id: restaurant.id,
            title: demoItem.category,
            title_en: demoItem.category,
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
        .eq('title', demoItem.subcategory || 'General')
        .maybeSingle();

      if (!subcategoryData.data) {
        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('subcategories')
          .insert({
            restaurant_id: restaurant.id,
            category_id: categoryData.data.id,
            title: demoItem.subcategory || 'General',
            title_en: demoItem.subcategory || 'General',
            order: 0,
            status: 'active'
          })
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;
        subcategoryData.data = newSubcategory;
      }

      // Handle image upload
      let imagePath = null;
      if (demoItem.image && demoItem.image.startsWith('data:image')) {
        try {
          const file = base64ToFile(demoItem.image, `demo-image-${Date.now()}.png`);
          const uploadResult = await uploadImage(file, 'menu-item', restaurant.id);
          imagePath = uploadResult.publicUrl; // Use publicUrl for image_path as expected by templates
        } catch (imgErr) {
          console.error('Failed to upload demo image:', imgErr);
        }
      }

      // Create menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurant.id,
          subcategory_id: subcategoryData.data.id,
          title: demoItem.title,
          title_en: demoItem.title,
          description: demoItem.description || '',
          description_en: demoItem.description || '',
          price: parseFloat(demoItem.price) || 0,
          image_path: imagePath,
          model_3d_url: demoItem.model3dGlbUrl || null,
          redirect_3d_url: demoItem.model3dUsdzUrl || null,
          order: 0,
          status: 'active'
        });

      if (itemError) throw itemError;

      // Clear demo item from local storage
      localStorage.removeItem(usedKey);

      // Clear menu data cache to ensure template updates
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`menu_data_${restaurant.id}`);
      }

      // Refresh items
      await fetchMenuItems();
      return true;

    } catch (err) {
      console.error('Error migrating demo item:', err);
      alert(`Migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsMigrating(false);
    }
  };

  // Auto-migrate on mount if items are empty and loading is done
  useEffect(() => {
    if (!loading && menuItems.length === 0) {
      migrateDemoItem();
    }
  }, [loading, menuItems.length, restaurant.id]);

  useEffect(() => {
    // Initial fetch
    fetchMenuItems();
  }, [restaurant.id]);

  // Form submission handler
  const handleFormSubmit = async (data: MenuEditorFormData) => {
    if (!data.title || !data.price || !data.category) {
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
        .eq('title', data.category)
        .maybeSingle();

      if (!categoryData.data) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            restaurant_id: restaurant.id,
            title: data.category,
            title_en: data.category,
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
        .eq('title', data.subcategory || 'General')
        .maybeSingle();

      if (!subcategoryData.data) {
        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('subcategories')
          .insert({
            restaurant_id: restaurant.id,
            category_id: categoryData.data.id,
            title: data.subcategory || 'General',
            title_en: data.subcategory || 'General',
            order: 0,
            status: 'active'
          })
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;
        subcategoryData.data = newSubcategory;
      }

      // Handle Main Image Upload
      let imagePath = null;
      if (data.previewImage?.[0] && data.previewImage[0] instanceof File) {
        try {
          const uploadResult = await uploadImage(data.previewImage[0], 'menu-item', restaurant.id);
          imagePath = uploadResult.publicUrl;
        } catch (imgErr) {
          console.error('Failed to upload image:', imgErr);
        }
      }

      // Handle Detailed Images Upload (4 images)
      const additionalImagePaths: string[] = [];
      if (data.selectedImages && data.selectedImages.length > 0) {
        for (const img of data.selectedImages) {
          if (img instanceof File) {
            try {
              const uploadResult = await uploadImage(img, 'menu-item', restaurant.id);
              additionalImagePaths.push(uploadResult.publicUrl);
            } catch (detailImgErr) {
              console.error('Failed to upload detail image:', detailImgErr);
            }
          } else if (typeof img === 'string') {
            // Keep existing URL if any (though unlikely for new item)
            additionalImagePaths.push(img);
          }
        }
      }

      // Create menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurant.id,
          subcategory_id: subcategoryData.data.id,
          title: data.title,
          title_en: data.title,
          description: data.description || '',
          description_en: data.description || '',
          price: parseFloat(data.price) || 0,
          image_path: imagePath,
          additional_image_url: additionalImagePaths.length > 0 ? JSON.stringify(additionalImagePaths) : null,
          model_3d_url: data.model3dGlbUrl?.trim() || null,
          redirect_3d_url: data.model3dUsdzUrl?.trim() || null,
          order: 0,
          status: 'active'
        });

      if (itemError) throw itemError;

      // Refresh menu items
      await fetchMenuItems();
      await fetchTaxonomy();

      // Clear cache to ensure template updates
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`menu_data_${restaurant.id}`);
      }

      // Reset form handled by updating key
      setFormKey(prev => prev + 1);

    } catch (err: any) {
      console.error('Error creating menu item:', err);
      alert(`Failed to create menu item: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (template: string) => {
    setSelectedTemplate(template);

    // Notify parent
    if (onTemplateChange) {
      onTemplateChange(template);
    }

    // Save template to database
    try {
      await supabase
        .from('restaurants')
        .update({ template } as any)
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

      // Clear cache to ensure template updates
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`menu_data_${restaurant.id}`);
      }
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
      <div className="px-5 pb-12">
        <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '0.6fr 1fr' }}>
          {/* Left Column - Add Items */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-primary font-loubag uppercase">
                {menuItems.length > 0 ? 'Add More Items' : 'Add Menu Item'}
              </h3>
              {menuItems.length > 0 && (
                <button
                  onClick={() => setShowItemsModal(true)}
                  className="text-sm font-semibold text-[#F34A23] hover:text-[#d63e1b] underline"
                >
                  See All ({menuItems.length})
                </button>
              )}
            </div>

            {/* Item Form */}
            <MenuEditorForm
              key={formKey}
              onSubmit={handleFormSubmit}
              isLoading={loading}
              submitLabel={loading ? 'Adding...' : 'Add Item'}
              show3DInputs={true}
              showDetailedImageUpload={true}
              existingCategories={categories}
              existingSubcategories={subcategories}
            />
          </div>

          {/* Right Column - Choose Your Template */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border flex flex-col h-fit" style={{ borderColor: 'rgba(71, 67, 67, 0.05)' }}>
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 font-loubag uppercase">
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
              {selectedTemplate === 'template1' && (
                <div key="template1" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template1 restaurant={restaurant} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {selectedTemplate === 'template2' && (
                <div key="template2" className="h-full overflow-auto animate-fade-in bg-gray-100/50">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template2 restaurant={restaurant} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {selectedTemplate === 'template3' && (
                <div key="template3" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template3 restaurant={restaurant} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {selectedTemplate === 'template4' && (
                <div key="template4" className="h-full overflow-auto animate-fade-in bg-gray-100/50 scrollbar-light">
                  <div className="max-w-[768px] mx-auto min-h-full shadow-2xl">
                    <Template4 restaurant={restaurant} demoItem={demoItem} />
                  </div>
                </div>
              )}

              {menuItems.length === 0 && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => {
                      const hasDemo = localStorage.getItem('ochel_demo_menu_item');
                      const hasFirstTime = localStorage.getItem('ochel_first_time_menu_item');

                      if (hasDemo || hasFirstTime) {
                        migrateDemoItem();
                      } else {
                        alert('No demo item found in storage.');
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    Import Demo Item
                  </button>
                </div>
              )}

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
      {/* Items List Modal */}
      {showItemsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowItemsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-primary font-plus-jakarta-sans">Your Menu Items</h3>
              <button
                onClick={() => setShowItemsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
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
                      onClick={() => {
                        handleDelete(item.id);
                        if (menuItems.length <= 1) setShowItemsModal(false);
                      }}
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
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowItemsModal(false)}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
