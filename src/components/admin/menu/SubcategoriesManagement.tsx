'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { subcategoryService, categoryService, Subcategory, Category } from '@/services';
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

interface SubcategoryModalProps {
  subcategory?: Subcategory | null;
  categories: Category[];
  onSave: (subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at' | 'order'>) => Promise<void>;
  onClose: () => void;
}

function SubcategoryModal({ subcategory, categories, onSave, onClose }: SubcategoryModalProps) {
  const [categoryId, setCategoryId] = useState(subcategory?.category_id || categories[0]?.id || 0);

  // French (source)
  const [title, setTitle] = useState(subcategory?.title || '');
  const [text, setText] = useState(subcategory?.text || '');

  // English
  const [titleEn, setTitleEn] = useState(subcategory?.title_en || '');
  const [textEn, setTextEn] = useState(subcategory?.text_en || '');

  // Italian
  const [titleIt, setTitleIt] = useState(subcategory?.title_it || '');
  const [textIt, setTextIt] = useState(subcategory?.text_it || '');

  // Spanish
  const [titleEs, setTitleEs] = useState(subcategory?.title_es || '');
  const [textEs, setTextEs] = useState(subcategory?.text_es || '');

  // Active language tab
  const [activeTab, setActiveTab] = useState<'fr' | 'en' | 'it' | 'es'>('fr');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle global translation
  const handleGlobalTranslate = (translations: {
    en: { [key: string]: string };
    it: { [key: string]: string };
    es: { [key: string]: string };
  }) => {
    // Update English fields
    if (translations.en.title) setTitleEn(translations.en.title);
    if (translations.en.text) setTextEn(translations.en.text);

    // Update Italian fields
    if (translations.it.title) setTitleIt(translations.it.title);
    if (translations.it.text) setTextIt(translations.it.text);

    // Update Spanish fields
    if (translations.es.title) setTitleEs(translations.es.title);
    if (translations.es.text) setTextEs(translations.es.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave({
        category_id: categoryId,
        title: title.trim(),
        text: text.trim() || null,
        title_en: titleEn.trim() || null,
        text_en: textEn.trim() || null,
        title_it: titleIt.trim() || null,
        text_it: textIt.trim() || null,
        title_es: titleEs.trim() || null,
        text_es: textEs.trim() || null,
        status: subcategory?.status || 'active',
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
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
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
          {subcategory ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
        </h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection (always visible) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie parente <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#F34A23] text-gray-900 cursor-pointer"
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

          {/* Language Tabs */}
          <LanguageTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sourceFields={{ title, text }}
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
                  placeholder="Ex: Pizzas, Pâtes, Viandes..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Description optionnelle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#F34A23] text-gray-900 placeholder:text-gray-400"
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
                label="Description (EN)"
                sourceText={text}
                value={textEn}
                onChange={setTextEn}
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
                label="Description (IT)"
                sourceText={text}
                value={textIt}
                onChange={setTextIt}
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
                label="Description (ES)"
                sourceText={text}
                value={textEs}
                onChange={setTextEs}
                targetLang="es"
                multiline
                rows={3}
              />
            </>
          )}

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

interface SortableSubcategoryRowProps {
  subcategory: Subcategory;
  sameCategorySubcats: Subcategory[];
  deletingId: number | null;
  getCategoryName: (id: number) => string;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategory: Subcategory) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
}

function SortableSubcategoryRow({
  subcategory,
  sameCategorySubcats,
  deletingId,
  getCategoryName,
  onEdit,
  onDelete,
  onReorder,
}: SortableSubcategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const indexInCategory = sameCategorySubcats.findIndex(s => s.id === subcategory.id);
  const isFirst = indexInCategory === 0;
  const isLast = indexInCategory === sameCategorySubcats.length - 1;

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
          <span className="text-sm text-gray-700 font-medium">{subcategory.order}</span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onReorder(subcategory.id, 'up')}
              disabled={isFirst || deletingId === subcategory.id}
              className="hidden p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Monter"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onReorder(subcategory.id, 'down')}
              disabled={isLast || deletingId === subcategory.id}
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
        <div className="text-sm font-medium text-gray-900">{subcategory.title}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className="text-sm text-gray-500">{getCategoryName(subcategory.category_id)}</div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {subcategory.text || '-'}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subcategory.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
          }`}>
          {subcategory.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onEdit(subcategory)}
            variant="outline"
            size="sm"
            disabled={deletingId === subcategory.id}
          >
            Modifier
          </Button>
          <Button
            onClick={() => onDelete(subcategory)}
            variant="outline"
            size="sm"
            disabled={deletingId === subcategory.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deletingId === subcategory.id ? '...' : 'Supprimer'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface SubcategoriesManagementProps {
  restaurantId: string;
}

export function SubcategoriesManagement({ restaurantId }: SubcategoriesManagementProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subcatsData, catsData] = await Promise.all([
        subcategoryService.getAll(restaurantId),
        categoryService.getAll(restaurantId),
      ]);
      setSubcategories(subcatsData);
      setCategories(catsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Helper function to get category name
  const getCategoryName = (categoryId: number): string => {
    return categories.find((c) => c.id === categoryId)?.title || 'N/A';
  };

  // Apply search and category filters
  const filteredSubcategories = useMemo(() => {
    // First, filter out "General" subcategories
    let filtered = subcategories.filter(subcat =>
      !subcat.title.toLowerCase().includes('general')
    );

    // Apply category filter
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter(subcat => subcat.category_id === selectedCategoryId);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subcat =>
        subcat.title.toLowerCase().includes(query) ||
        subcat.text?.toLowerCase().includes(query) ||
        getCategoryName(subcat.category_id).toLowerCase().includes(query)
      );
    }

    // Sort by order for proper display
    return filtered.sort((a, b) => a.order - b.order);
  }, [subcategories, searchQuery, selectedCategoryId, categories]);

  // Pagination
  const totalPages = Math.ceil(filteredSubcategories.length / itemsPerPage);
  const paginatedSubcategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubcategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubcategories, currentPage, itemsPerPage]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId]);

  const handleCreate = () => {
    setEditingSubcategory(null);
    setShowModal(true);
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setShowModal(true);
  };

  const handleSave = async (subcategoryData: Omit<Subcategory, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    if (editingSubcategory) {
      await subcategoryService.update(editingSubcategory.id, subcategoryData, restaurantId);
    } else {
      await subcategoryService.create(subcategoryData);
    }
    // Notify all tabs that menu data has changed
    const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
    menuUpdateChannel.postMessage('invalidate');
    menuUpdateChannel.close();
    await loadData();
  };

  const handleDeleteClick = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    try {
      setDeletingId(subcategoryToDelete.id);
      setError(null);
      await subcategoryService.delete(subcategoryToDelete.id, restaurantId);
      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadData();
      setShowDeleteModal(false);
      setSubcategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSubcategoryToDelete(null);
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      setError(null);
      await subcategoryService.reorder(id, direction);
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

    // Get the dragged subcategory and target subcategory
    const draggedSubcat = subcategories.find(s => s.id === active.id);
    const targetSubcat = subcategories.find(s => s.id === over.id);

    if (!draggedSubcat || !targetSubcat) return;

    // Prevent dragging to a different category
    if (draggedSubcat.category_id !== targetSubcat.category_id) {
      return;
    }

    // Only work with subcategories in the same category
    const sameCategorySubcats = subcategories
      .filter(s => s.category_id === draggedSubcat.category_id)
      .sort((a, b) => a.order - b.order);

    const oldIndex = sameCategorySubcats.findIndex(s => s.id === active.id);
    const newIndex = sameCategorySubcats.findIndex(s => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally for IMMEDIATE feedback
    const reorderedSubcats = arrayMove(sameCategorySubcats, oldIndex, newIndex);

    // Update order values - assign sequential orders
    const updatedSubcats = reorderedSubcats.map((subcat, index) => ({
      ...subcat,
      order: sameCategorySubcats[0].order + index, // Start from the first order and increment
    }));

    // Update local state immediately - create new array with updated objects
    const newSubcategories = subcategories.map(s => {
      const updated = updatedSubcats.find(u => u.id === s.id);
      return updated ? { ...updated } : { ...s };
    });
    setSubcategories([...newSubcategories]);

    // Calculate updates for backend - send all items that changed
    const updates = updatedSubcats.map(subcat => ({
      id: subcat.id,
      order: subcat.order,
    }));

    // Update backend asynchronously
    try {
      setError(null);
      await subcategoryService.updateBulkOrder(updates);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des sous-catégories...</span>
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
          Sous-catégories ({filteredSubcategories.length})
        </h3>
        <Button onClick={handleCreate} size="sm" disabled={categories.length === 0}>
          + Ajouter une sous-catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous devez d'abord créer au moins une catégorie</p>
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher par titre, description ou catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#F34A23] text-gray-900"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredSubcategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                {subcategories.length === 0 ? 'Aucune sous-catégorie pour le moment' : 'Aucun résultat trouvé'}
              </p>
              {subcategories.length === 0 && (
                <Button onClick={handleCreate} variant="outline">
                  Créer la première sous-catégorie
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
                            Titre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Catégorie
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <SortableContext
                          items={paginatedSubcategories.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {paginatedSubcategories.map((subcategory) => {
                            const sameCategorySubcats = filteredSubcategories.filter(s => s.category_id === subcategory.category_id);
                            return (
                              <SortableSubcategoryRow
                                key={subcategory.id}
                                subcategory={subcategory}
                                sameCategorySubcats={sameCategorySubcats}
                                deletingId={deletingId}
                                getCategoryName={getCategoryName}
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
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSubcategories.length)}</span> sur{' '}
                        <span className="font-medium">{filteredSubcategories.length}</span> résultats
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
        </>
      )}

      {showModal && (
        <SubcategoryModal
          subcategory={editingSubcategory}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingSubcategory(null);
          }}
        />
      )}

      {showDeleteModal && subcategoryToDelete && (
        <ConfirmationModal
          title="Supprimer la sous-catégorie"
          message={`Êtes-vous sûr de vouloir supprimer la sous-catégorie "${subcategoryToDelete.title}" ? Tous les éléments de menu associés seront également supprimés (cascade).`}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletingId === subcategoryToDelete.id}
        />
      )}
    </div>
  );
}
