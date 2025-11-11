'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { menuItemService, categoryService, subcategoryService, MenuItem, Category, Subcategory } from '@/services/menuService';
import { ImageUpload } from './ImageUpload';
import { ConfirmationModal } from './ConfirmationModal';
import { LanguageTabs } from './translation/LanguageTabs';
import { TranslationField } from './translation/TranslationField';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItemModalProps {
  menuItem?: MenuItem | null;
  categories: Category[];
  subcategories: Subcategory[];
  onSave: (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'order'>) => Promise<void>;
  onClose: () => void;
}

function MenuItemModal({ menuItem, categories, subcategories, onSave, onClose }: MenuItemModalProps) {
  // French (source)
  const [title, setTitle] = useState(menuItem?.title || '');
  const [text, setText] = useState(menuItem?.text || '');
  const [description, setDescription] = useState(menuItem?.description || '');

  // English
  const [titleEn, setTitleEn] = useState(menuItem?.title_en || '');
  const [textEn, setTextEn] = useState(menuItem?.text_en || '');
  const [descriptionEn, setDescriptionEn] = useState(menuItem?.description_en || '');

  // Italian
  const [titleIt, setTitleIt] = useState(menuItem?.title_it || '');
  const [textIt, setTextIt] = useState(menuItem?.text_it || '');
  const [descriptionIt, setDescriptionIt] = useState(menuItem?.description_it || '');

  // Spanish
  const [titleEs, setTitleEs] = useState(menuItem?.title_es || '');
  const [textEs, setTextEs] = useState(menuItem?.text_es || '');
  const [descriptionEs, setDescriptionEs] = useState(menuItem?.description_es || '');

  // Active language tab
  const [activeTab, setActiveTab] = useState<'fr' | 'en' | 'it' | 'es'>('fr');

  // Handle global translation
  const handleGlobalTranslate = (translations: {
    en: { [key: string]: string };
    it: { [key: string]: string };
    es: { [key: string]: string };
  }) => {
    // Update English fields
    if (translations.en.title) setTitleEn(translations.en.title);
    if (translations.en.text) setTextEn(translations.en.text);
    if (translations.en.description) setDescriptionEn(translations.en.description);

    // Update Italian fields
    if (translations.it.title) setTitleIt(translations.it.title);
    if (translations.it.text) setTextIt(translations.it.text);
    if (translations.it.description) setDescriptionIt(translations.it.description);

    // Update Spanish fields
    if (translations.es.title) setTitleEs(translations.es.title);
    if (translations.es.text) setTextEs(translations.es.text);
    if (translations.es.description) setDescriptionEs(translations.es.description);
  };

  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [imagePath, setImagePath] = useState(menuItem?.image_path || '');
  const [model3dGlbUrl, setModel3dGlbUrl] = useState(menuItem?.model_3d_url || '');
  const [model3dUsdzUrl, setModel3dUsdzUrl] = useState(menuItem?.redirect_3d_url || '');
  const [isSpecial, setIsSpecial] = useState(menuItem?.is_special || false);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [subcategoryId, setSubcategoryId] = useState<number>(0);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize category and subcategory for editing
  useEffect(() => {
    if (menuItem) {
      const subcat = subcategories.find(s => s.id === menuItem.subcategory_id);
      if (subcat) {
        setCategoryId(subcat.category_id);
        setSubcategoryId(menuItem.subcategory_id);
      }
    }
  }, [menuItem, subcategories]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      // Filter by category and exclude "General" subcategories from dropdown
      const filtered = subcategories.filter(s =>
        s.category_id === categoryId && !s.title.toLowerCase().includes('general')
      );
      setFilteredSubcategories(filtered);

      // Auto-select General subcategory if available and not editing
      if (!menuItem) {
        const allCategorySubcats = subcategories.filter(s => s.category_id === categoryId);
        const generalSubcat = allCategorySubcats.find(s => s.title.toLowerCase().includes('general'));
        if (generalSubcat) {
          setSubcategoryId(generalSubcat.id);
        } else if (filtered.length > 0) {
          setSubcategoryId(filtered[0].id);
        }
      }
    } else {
      setFilteredSubcategories([]);
      if (!menuItem) {
        setSubcategoryId(0);
      }
    }
  }, [categoryId, subcategories, menuItem]);

  // When isSpecial changes, auto-select General subcategory
  useEffect(() => {
    if (isSpecial && categoryId) {
      const allCategorySubcats = subcategories.filter(s => s.category_id === categoryId);
      const generalSubcat = allCategorySubcats.find(s => s.title.toLowerCase().includes('general'));
      if (generalSubcat) {
        setSubcategoryId(generalSubcat.id);
      }
    }
  }, [isSpecial, categoryId, subcategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Le prix doit être un nombre positif');
      return;
    }

    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // If no subcategory selected, find or use the General subcategory
      let finalSubcategoryId = subcategoryId;
      if (!finalSubcategoryId) {
        // Look in all subcategories for this category (including General)
        const allCategorySubcats = subcategories.filter(s => s.category_id === categoryId);
        const generalSubcat = allCategorySubcats.find(s => s.title.toLowerCase().includes('general'));
        if (generalSubcat) {
          finalSubcategoryId = generalSubcat.id;
        } else {
          setError('Aucune sous-catégorie disponible. Veuillez d\'abord créer une sous-catégorie.');
          setSaving(false);
          return;
        }
      }

      await onSave({
        title: title.trim(),
        text: text.trim() || null,
        description: description.trim() || null,
        title_en: titleEn.trim() || null,
        text_en: textEn.trim() || null,
        description_en: descriptionEn.trim() || null,
        title_it: titleIt.trim() || null,
        text_it: textIt.trim() || null,
        description_it: descriptionIt.trim() || null,
        title_es: titleEs.trim() || null,
        text_es: textEs.trim() || null,
        description_es: descriptionEs.trim() || null,
        price: parseFloat(price),
        image_path: imagePath.trim() || null,
        model_3d_url: model3dGlbUrl.trim() || null,
        redirect_3d_url: model3dUsdzUrl.trim() || null,
        additional_image_url: null,
        is_special: isSpecial,
        subcategory_id: finalSubcategoryId,
        status: menuItem?.status || 'active',
        created_by: null,
        updated_by: null,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-base md:text-lg font-semibold mb-4">
          {menuItem ? 'Modifier l\'élément de menu' : 'Nouvel élément de menu'}
        </h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language Tabs */}
          <LanguageTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sourceFields={{ title, text, description }}
            onGlobalTranslate={handleGlobalTranslate}
          />

          {/* French Fields */}
          {activeTab === 'fr' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Salade César, Steak Frites..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte court
                </label>
                <Input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Texte court optionnel..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description complète du plat..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* English Fields */}
          {activeTab === 'en' && (
            <>
              <TranslationField
                label="Titre (EN)"
                sourceText={title}
                value={titleEn}
                onChange={setTitleEn}
                targetLang="en"
              />
              <TranslationField
                label="Texte court (EN)"
                sourceText={text}
                value={textEn}
                onChange={setTextEn}
                targetLang="en"
              />
              <TranslationField
                label="Description (EN)"
                sourceText={description}
                value={descriptionEn}
                onChange={setDescriptionEn}
                targetLang="en"
                multiline
                rows={3}
              />
            </>
          )}

          {/* Italian Fields */}
          {activeTab === 'it' && (
            <>
              <TranslationField
                label="Titre (IT)"
                sourceText={title}
                value={titleIt}
                onChange={setTitleIt}
                targetLang="it"
              />
              <TranslationField
                label="Texte court (IT)"
                sourceText={text}
                value={textIt}
                onChange={setTextIt}
                targetLang="it"
              />
              <TranslationField
                label="Description (IT)"
                sourceText={description}
                value={descriptionIt}
                onChange={setDescriptionIt}
                targetLang="it"
                multiline
                rows={3}
              />
            </>
          )}

          {/* Spanish Fields */}
          {activeTab === 'es' && (
            <>
              <TranslationField
                label="Titre (ES)"
                sourceText={title}
                value={titleEs}
                onChange={setTitleEs}
                targetLang="es"
              />
              <TranslationField
                label="Texte court (ES)"
                sourceText={text}
                value={textEs}
                onChange={setTextEs}
                targetLang="es"
              />
              <TranslationField
                label="Description (ES)"
                sourceText={description}
                value={descriptionEs}
                onChange={setDescriptionEs}
                targetLang="es"
                multiline
                rows={3}
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 cursor-pointer"
              required
            >
              <option value="" className="text-gray-500">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-gray-900">
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSpecial"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="w-4 h-4 text-[#F34A23] border-gray-300 rounded focus:ring-[#F34A23] cursor-pointer"
            />
            <label htmlFor="isSpecial" className="text-sm font-medium text-gray-700 cursor-pointer">
              Élément spécial
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-catégorie
            </label>
            <select
              value={subcategoryId || ''}
              onChange={(e) => setSubcategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!categoryId || isSpecial}
            >
              <option value="" className="text-gray-500">
                {!categoryId ? 'Sélectionner d\'abord une catégorie' : isSpecial ? 'Général (auto-sélectionné pour les spéciaux)' : 'Général (par défaut)'}
              </option>
              {filteredSubcategories.map((subcat) => (
                <option key={subcat.id} value={subcat.id} className="text-gray-900">
                  {subcat.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {isSpecial ? 'Les éléments spéciaux sont automatiquement assignés à la sous-catégorie générale' : 'Laissez vide pour utiliser la sous-catégorie générale par défaut'}
            </p>
          </div>

          <ImageUpload
            value={imagePath}
            onChange={setImagePath}
            folder="menu-item"
            label="Image principale"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du modèle 3D GLB (Android/Web)
            </label>
            <Input
              type="url"
              value={model3dGlbUrl}
              onChange={(e) => setModel3dGlbUrl(e.target.value)}
              placeholder="https://example.com/model.glb"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format GLB pour Android et affichage web 3D
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du modèle 3D USDZ (iOS AR)
            </label>
            <Input
              type="url"
              value={model3dUsdzUrl}
              onChange={(e) => setModel3dUsdzUrl(e.target.value)}
              placeholder="https://example.com/model.usdz"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format USDZ pour la réalité augmentée iOS
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving} className="flex-1 order-2 sm:order-1">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 order-1 sm:order-2">
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SortableMenuItemRowProps {
  item: MenuItem;
  sameSubcatItems: MenuItem[];
  deletingId: number | null;
  getCategoryName: (subcategoryId: number) => string;
  getSubcategoryName: (subcategoryId: number) => string;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
}

function SortableMenuItemRow({
  item,
  sameSubcatItems,
  deletingId,
  getCategoryName,
  getSubcategoryName,
  onEdit,
  onDelete,
  onReorder,
}: SortableMenuItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const indexInSubcat = sameSubcatItems.findIndex(i => i.id === item.id);
  const isFirst = indexInSubcat === 0;
  const isLast = indexInSubcat === sameSubcatItems.length - 1;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100' : ''}`}
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
            aria-label="Glisser pour réorganiser"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </button>
          <span className="text-sm text-gray-700 font-medium">{item.order}</span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onReorder(item.id, 'up')}
              disabled={isFirst || deletingId === item.id}
              className="hidden p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Monter"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onReorder(item.id, 'down')}
              disabled={isLast || deletingId === item.id}
              className="hidden p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Descendre"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {item.image_path ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={item.image_path}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Pas d'image</span>
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-gray-900">{item.title}</div>
        {item.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
        )}
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-700">{getCategoryName(item.subcategory_id)}</div>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="text-sm text-gray-700">{getSubcategoryName(item.subcategory_id)}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
        {item.is_special && (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Spécial
          </span>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onEdit(item)}
            variant="outline"
            size="sm"
            disabled={deletingId === item.id}
          >
            Modifier
          </Button>
          <Button
            onClick={() => onDelete(item)}
            variant="outline"
            size="sm"
            disabled={deletingId === item.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deletingId === item.id ? '...' : 'Supprimer'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function MenuItemsManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [filterSubcategory, setFilterSubcategory] = useState<number | 'all' | 'special' | 'regular'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [itemsData, catsData, subcatsData] = await Promise.all([
        menuItemService.getAll(),
        categoryService.getAll(),
        subcategoryService.getAll(),
      ]);
      setMenuItems(itemsData);
      setCategories(catsData);
      setSubcategories(subcatsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter subcategories based on selected category (excluding General)
  const availableSubcategories = useMemo(() => {
    if (filterCategory === 'all') return [];
    return subcategories.filter(s =>
      s.category_id === filterCategory && !s.title.toLowerCase().includes('general')
    );
  }, [filterCategory, subcategories]);

  // Get the General subcategory ID for the selected category
  const generalSubcategoryId = useMemo(() => {
    if (filterCategory === 'all') return null;
    const generalSubcat = subcategories.find(s =>
      s.category_id === filterCategory && s.title.toLowerCase().includes('general')
    );
    return generalSubcat?.id || null;
  }, [filterCategory, subcategories]);

  // Apply search and filters
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems;

    // Category filter first
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => {
        const subcat = subcategories.find(s => s.id === item.subcategory_id);
        return subcat?.category_id === filterCategory;
      });
    }

    // Subcategory/Special/Regular filter second
    if (filterSubcategory === 'special') {
      // Show only special items (which should be under General subcategory)
      filtered = filtered.filter(item => item.is_special);
    } else if (filterSubcategory === 'regular') {
      // Show only regular items under General subcategory (not special)
      filtered = filtered.filter(item =>
        !item.is_special && item.subcategory_id === generalSubcategoryId
      );
    } else if (typeof filterSubcategory === 'number') {
      // Show items under specific subcategory
      filtered = filtered.filter(item => item.subcategory_id === filterSubcategory);
    }

    // Search filter last
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const subcat = subcategories.find(s => s.id === item.subcategory_id);
        const cat = subcat ? categories.find(c => c.id === subcat.category_id) : null;

        return (
          item.title.toLowerCase().includes(query) ||
          item.text?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          cat?.title.toLowerCase().includes(query) ||
          subcat?.title.toLowerCase().includes(query)
        );
      });
    }

    // Sort by order for proper display
    return filtered.sort((a, b) => a.order - b.order);
  }, [menuItems, searchQuery, filterCategory, filterSubcategory, categories, subcategories]);

  // Pagination
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMenuItems, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterSubcategory]);

  const handleCreate = () => {
    setEditingMenuItem(null);
    setShowModal(true);
  };

  const handleEdit = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    setShowModal(true);
  };

  const handleSave = async (menuItemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    if (editingMenuItem) {
      await menuItemService.update(editingMenuItem.id, menuItemData);
    } else {
      await menuItemService.create(menuItemData);
    }
    // Notify all tabs that menu data has changed
    const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
    menuUpdateChannel.postMessage('invalidate');
    menuUpdateChannel.close();
    await loadData();
  };

  const handleDeleteClick = (item: MenuItem) => {
    setMenuItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!menuItemToDelete) return;

    try {
      setDeletingId(menuItemToDelete.id);
      setError(null);
      await menuItemService.delete(menuItemToDelete.id);
      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadData();
      setShowDeleteModal(false);
      setMenuItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMenuItemToDelete(null);
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      setError(null);
      await menuItemService.reorder(id, direction);
      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du réordonnancement');
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Get the dragged menu item and target menu item
    const draggedItem = menuItems.find(i => i.id === active.id);
    const targetItem = menuItems.find(i => i.id === over.id);

    if (!draggedItem || !targetItem) return;

    // Prevent dragging to a different subcategory
    if (draggedItem.subcategory_id !== targetItem.subcategory_id) {
      return;
    }

    // Only work with menu items in the same subcategory
    const sameSubcatItems = menuItems
      .filter(i => i.subcategory_id === draggedItem.subcategory_id)
      .sort((a, b) => a.order - b.order);

    const oldIndex = sameSubcatItems.findIndex(i => i.id === active.id);
    const newIndex = sameSubcatItems.findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally for IMMEDIATE feedback
    const reorderedItems = arrayMove(sameSubcatItems, oldIndex, newIndex);

    // Update order values - assign sequential orders
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: sameSubcatItems[0].order + index,
    }));

    // Update local state immediately - create new array with updated objects
    const newMenuItems = menuItems.map(i => {
      const updated = updatedItems.find(u => u.id === i.id);
      return updated ? { ...updated } : { ...i };
    });
    setMenuItems([...newMenuItems]);

    // Calculate updates for backend - send all items that changed
    const updates = updatedItems.map(item => ({
      id: item.id,
      order: item.order,
    }));

    // Update backend asynchronously
    try {
      setError(null);
      await menuItemService.updateBulkOrder(updates);

      // Notify all tabs
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du réordonnancement');
      // Revert on error
      await loadData();
    }
  };

  const getCategoryName = (subcategoryId: number): string => {
    const subcat = subcategories.find((s) => s.id === subcategoryId);
    if (!subcat) return 'N/A';
    const cat = categories.find((c) => c.id === subcat.category_id);
    return cat?.title || 'N/A';
  };

  const getSubcategoryName = (subcategoryId: number): string => {
    return subcategories.find((s) => s.id === subcategoryId)?.title || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des éléments de menu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Éléments de menu ({filteredMenuItems.length})
        </h3>
        <Button onClick={handleCreate} size="sm" disabled={categories.length === 0}>
          + Ajouter un élément
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher par titre, description, catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setFilterSubcategory('all');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 cursor-pointer md:w-48"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>

          {/* Subcategory Filter */}
          <select
            value={filterSubcategory}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all' || value === 'special' || value === 'regular') {
                setFilterSubcategory(value);
              } else {
                setFilterSubcategory(Number(value));
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:border-transparent text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed md:w-48"
            disabled={filterCategory === 'all'}
          >
            <option value="all">
              {filterCategory === 'all' ? 'Sélectionner d\'abord une catégorie' : 'Tous les éléments'}
            </option>
            {filterCategory !== 'all' && (
              <>
                <option value="special">Special</option>
                <option value="regular">Regular</option>
              </>
            )}
            {availableSubcategories.map((subcat) => (
              <option key={subcat.id} value={subcat.id}>
                {subcat.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous devez d'abord créer au moins une catégorie</p>
        </div>
      ) : filteredMenuItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {menuItems.length === 0 ? 'Aucun élément de menu pour le moment' : 'Aucun résultat trouvé'}
          </p>
          {menuItems.length === 0 && (
            <Button onClick={handleCreate} variant="outline">
              Créer le premier élément
            </Button>
          )}
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Catégorie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Sous-catégorie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Spécial
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <SortableContext
                      items={paginatedItems.map(i => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {paginatedItems.map((item) => {
                        const sameSubcatItems = filteredMenuItems.filter(i => i.subcategory_id === item.subcategory_id);
                        return (
                          <SortableMenuItemRow
                            key={item.id}
                            item={item}
                            sameSubcatItems={sameSubcatItems}
                            deletingId={deletingId}
                            getCategoryName={getCategoryName}
                            getSubcategoryName={getSubcategoryName}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onReorder={handleReorder}
                          />
                        );
                      })}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </div>
          </DndContext>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-700 self-center">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Suivant
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMenuItems.length)}</span> sur{' '}
                    <span className="font-medium">{filteredMenuItems.length}</span> résultats
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <MenuItemModal
          menuItem={editingMenuItem}
          categories={categories}
          subcategories={subcategories}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMenuItem(null);
          }}
        />
      )}

      {showDeleteModal && menuItemToDelete && (
        <ConfirmationModal
          title="Supprimer l'élément de menu"
          message={`Êtes-vous sûr de vouloir supprimer "${menuItemToDelete.title}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletingId === menuItemToDelete.id}
        />
      )}
    </div>
  );
}
