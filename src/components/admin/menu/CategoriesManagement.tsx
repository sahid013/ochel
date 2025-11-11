'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { categoryService, subcategoryService, Category } from '@/services/menuService';
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

interface CategoryModalProps {
  category?: Category | null;
  onSave: (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'order'>) => Promise<void>;
  onClose: () => void;
}

function CategoryModal({ category, onSave, onClose }: CategoryModalProps) {
  // French (source)
  const [title, setTitle] = useState(category?.title || '');
  const [text, setText] = useState(category?.text || '');

  // English
  const [titleEn, setTitleEn] = useState(category?.title_en || '');
  const [textEn, setTextEn] = useState(category?.text_en || '');

  // Italian
  const [titleIt, setTitleIt] = useState(category?.title_it || '');
  const [textIt, setTextIt] = useState(category?.text_it || '');

  // Spanish
  const [titleEs, setTitleEs] = useState(category?.title_es || '');
  const [textEs, setTextEs] = useState(category?.text_es || '');

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

    try {
      setSaving(true);
      setError(null);

      await onSave({
        title: title.trim(),
        text: text.trim() || null,
        title_en: titleEn.trim() || null,
        text_en: textEn.trim() || null,
        title_it: titleIt.trim() || null,
        text_it: textIt.trim() || null,
        title_es: titleEs.trim() || null,
        text_es: textEs.trim() || null,
        status: category?.status || 'active',
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
          {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                  placeholder="Ex: Entrées, Plats, Desserts..."
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

interface SortableCategoryRowProps {
  category: Category;
  index: number;
  totalItems: number;
  deletingId: number | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
}

function SortableCategoryRow({
  category,
  index,
  totalItems,
  deletingId,
  onEdit,
  onDelete,
  onReorder,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
          <span className="text-sm text-gray-700 font-medium">{category.order}</span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onReorder(category.id, 'up')}
              disabled={index === 0 || deletingId === category.id}
              className="hidden p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Monter"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onReorder(category.id, 'down')}
              disabled={index === totalItems - 1 || deletingId === category.id}
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
        <div className="text-sm font-medium text-gray-900">{category.title}</div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {category.text || '-'}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          category.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {category.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onEdit(category)}
            variant="outline"
            size="sm"
            disabled={deletingId === category.id}
          >
            Modifier
          </Button>
          <Button
            onClick={() => onDelete(category)}
            variant="outline"
            size="sm"
            disabled={deletingId === category.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deletingId === category.id ? '...' : 'Supprimer'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Apply search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(cat =>
      cat.title.toLowerCase().includes(query) ||
      cat.text?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSave = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    if (editingCategory) {
      await categoryService.update(editingCategory.id, categoryData);
    } else {
      // Create the category
      const newCategory = await categoryService.create(categoryData);

      // Auto-create a "General" subcategory for the new category
      try {
        await subcategoryService.create({
          title: `${categoryData.title} - General`,
          text: null,
          category_id: newCategory.id,
          status: 'active',
          created_by: null,
          updated_by: null,
        });
      } catch (err) {
        console.error('Failed to create General subcategory:', err);
        // Don't block the category creation if subcategory creation fails
      }
    }
    // Notify all tabs that menu data has changed
    const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
    menuUpdateChannel.postMessage('invalidate');
    menuUpdateChannel.close();
    await loadCategories();
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingId(categoryToDelete.id);
      setError(null);
      await categoryService.delete(categoryToDelete.id);
      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      setError(null);
      await categoryService.reorder(id, direction);
      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du réordonnancement');
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
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

    // Find the old and new index in the full categories list
    const oldIndex = categories.findIndex(cat => cat.id === active.id);
    const newIndex = categories.findIndex(cat => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally for IMMEDIATE feedback (optimistic update)
    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

    // Update order values for all affected items
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      order: categories[index].order, // Swap order values to match new positions
    }));

    // Update local state immediately for instant UX
    setCategories(updatedCategories);

    // Calculate updates for backend
    const updates = updatedCategories
      .filter((cat, index) => cat.id !== categories[index].id) // Only send changed items
      .map(cat => ({
        id: cat.id,
        order: cat.order,
      }));

    // Update backend asynchronously
    try {
      setError(null);
      await categoryService.updateBulkOrder(updates);

      // Notify all tabs that menu data has changed
      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du réordonnancement');
      // Revert to original state on error
      await loadCategories();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Chargement des catégories...</span>
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
          Catégories ({filteredCategories.length})
        </h3>
        <Button onClick={handleCreate} size="sm">
          + Ajouter une catégorie
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Input
          type="text"
          placeholder="Rechercher par titre ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {categories.length === 0 ? 'Aucune catégorie pour le moment' : 'Aucun résultat trouvé'}
          </p>
          {categories.length === 0 && (
            <Button onClick={handleCreate} variant="outline">
              Créer la première catégorie
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
                      items={paginatedCategories.map(cat => cat.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {paginatedCategories.map((category, index) => (
                        <SortableCategoryRow
                          key={category.id}
                          category={category}
                          index={index}
                          totalItems={paginatedCategories.length}
                          deletingId={deletingId}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                          onReorder={handleReorder}
                        />
                      ))}
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
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> sur{' '}
                    <span className="font-medium">{filteredCategories.length}</span> résultats
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
        <CategoryModal
          category={editingCategory}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showDeleteModal && categoryToDelete && (
        <ConfirmationModal
          title="Supprimer la catégorie"
          message={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete.title}" ? Toutes les sous-catégories et éléments de menu associés seront également supprimés (cascade).`}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletingId === categoryToDelete.id}
        />
      )}
    </div>
  );
}
