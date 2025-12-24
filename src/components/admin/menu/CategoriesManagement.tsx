'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { categoryService, subcategoryService, Category } from '@/services';
import { ConfirmationModal } from './ConfirmationModal';
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
  // State for fields
  const [title, setTitle] = useState(category?.title || '');
  const [text, setText] = useState(category?.text || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave({
        title: title.trim(),
        text: text.trim() || null,
        title_en: category?.title_en || null,
        text_en: category?.text_en || null,
        title_it: category?.title_it || null,
        text_it: category?.text_it || null,
        title_es: category?.title_es || null,
        text_es: category?.text_es || null,
        status: category?.status || 'active',
        created_by: null,
        updated_by: null,
        restaurant_id: category?.restaurant_id || '',
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving category');
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

        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900">
          {category ? 'Edit Category' : 'New Category'}
        </h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pizzas, Pasta, Drinks..."
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
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#F34A23] text-gray-900 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving} className="flex-1 order-2 sm:order-1">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 order-1 sm:order-2">
              Cancel
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
            aria-label="Drag to reorder"
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
              aria-label="Move up"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onReorder(category.id, 'down')}
              disabled={index === totalItems - 1 || deletingId === category.id}
              className="hidden p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Move down"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 font-plus-jakarta-sans">{category.title}</div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-500 max-w-xs truncate font-inter">
          {category.text || '-'}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {category.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onEdit(category)}
            variant="outline"
            size="sm"
            disabled={deletingId === category.id}
            className="font-plus-jakarta-sans"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete(category)}
            variant="outline"
            size="sm"
            disabled={deletingId === category.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-plus-jakarta-sans"
          >
            {deletingId === category.id ? '...' : 'Delete'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface CategoriesManagementProps {
  restaurantId: string;
}

export function CategoriesManagement({ restaurantId }: CategoriesManagementProps) {
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
      const data = await categoryService.getAll(restaurantId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [restaurantId]);

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

  // Auto-heal order if we detect duplicates (like all 0s)
  useEffect(() => {
    if (loading || categories.length < 2) return;

    const uniqueOrders = new Set(categories.map(c => c.order));
    // If we have fewer unique order values than categories, we have duplicates/collisions
    if (uniqueOrders.size < categories.length) {
      console.log('Detected duplicate order values (e.g. all zeros). Auto-healing...');

      const healedUpdates = categories.map((cat, index) => ({
        id: cat.id,
        order: index // Assign sequential order based on current list position
      }));

      // Perform bulk update
      categoryService.updateBulkOrder(healedUpdates)
        .then(() => {
          console.log('Auto-healing complete. Refreshing...');
          // Notify all tabs that menu data has changed
          localStorage.setItem('menu_data_version', Date.now().toString());
          const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
          menuUpdateChannel.postMessage('invalidate');
          menuUpdateChannel.close();
          loadCategories(); // Reload to show correct state
        })
        .catch(err => console.error('Failed to auto-heal categories:', err));
    }
  }, [loading, categories.length]); // Run once when size changes or loading finishes

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
      await categoryService.update(editingCategory.id, categoryData, restaurantId);
    } else {
      // Create the category with restaurant_id
      const newCategory = await categoryService.create({
        ...categoryData,
        restaurant_id: restaurantId,
      });

      // Auto-create a "General" subcategory for the new category
      try {
        await subcategoryService.create({
          title: `${categoryData.title} - General`,
          text: null,
          category_id: newCategory.id,
          restaurant_id: restaurantId,
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
    // Update version first so tabs know the new truth
    localStorage.setItem('menu_data_version', Date.now().toString());

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
      await categoryService.delete(categoryToDelete.id, restaurantId);
      // Notify all tabs that menu data has changed
      // Update version first so tabs know the new truth
      localStorage.setItem('menu_data_version', Date.now().toString());

      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
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
      await categoryService.reorder(id, direction, restaurantId);
      // Notify all tabs that menu data has changed
      // Update version first so tabs know the new truth
      localStorage.setItem('menu_data_version', Date.now().toString());

      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reordering categories');
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
      order: index, // Use index as the new order to ensure sequential integrity
    }));

    // Update local state immediately for instant UX
    setCategories(updatedCategories);

    // Calculate updates for backend
    // Calculate updates for backend
    const updates = updatedCategories
      .filter(cat => {
        const original = categories.find(c => c.id === cat.id);
        // Update if the order has changed from what it was in the DB
        // This handles cases where items didn't move index but need a new order number (e.g. healing 0s)
        return original && original.order !== cat.order;
      })
      .map(cat => ({
        id: cat.id,
        order: cat.order,
      }));

    // Update backend asynchronously
    try {
      setError(null);
      await categoryService.updateBulkOrder(updates);

      // Notify all tabs that menu data has changed
      // Update version first so tabs know the new truth
      localStorage.setItem('menu_data_version', Date.now().toString());

      const menuUpdateChannel = new BroadcastChannel('menu-data-updates');
      menuUpdateChannel.postMessage('invalidate');
      menuUpdateChannel.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reordering categories');
      // Revert to original state on error
      await loadCategories();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
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
        <h3 className="text-lg font-semibold text-gray-900 font-plus-jakarta-sans">
          Categories ({filteredCategories.length})
        </h3>
        <Button onClick={handleCreate} size="sm" variant="primary" className="font-plus-jakarta-sans">
          + Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400 bg-white"
          style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {categories.length === 0 ? 'No categories yet' : 'No results found'}
          </p>
          {categories.length === 0 && (
            <Button onClick={handleCreate} variant="outline">
              Create first category
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-plus-jakarta-sans">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-plus-jakarta-sans">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell font-plus-jakarta-sans">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-plus-jakarta-sans">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-plus-jakarta-sans">
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
                  Previous
                </Button>
                <span className="text-sm text-gray-700 self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> sur{' '}
                    <span className="font-medium">{filteredCategories.length}</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
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
                    Next
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
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete.title}"? All associated subcategories and menu items will also be deleted (cascade).`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletingId === categoryToDelete.id}
        />
      )}
    </div>
  );
}
