'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CategoriesManagement } from './menu/CategoriesManagement';
import { SubcategoriesManagement } from './menu/SubcategoriesManagement';
import { MenuItemsManagement } from './menu/MenuItemsManagement';
import { AddonsManagement } from './menu/AddonsManagement';
import { FirstTimeMenuEditor } from './FirstTimeMenuEditor';
import { Restaurant } from '@/types';

const menuTabs = [
  { id: 'categories', label: 'Catégories' },
  { id: 'subcategories', label: 'Sous-catégories' },
  { id: 'items', label: 'Éléments de menu' },
  { id: 'addons', label: 'Add-ons' },
];

interface MenuManagementTabProps {
  restaurant: Restaurant;
}

export function MenuManagementTab({ restaurant }: MenuManagementTabProps) {
  const [activeTab, setActiveTab] = useState('categories');
  const [editorMode, setEditorMode] = useState<'detailed' | 'simple'>('detailed');

  if (!restaurant || !restaurant.id) {
    return <div className="p-4 text-center text-gray-500">Loading menu content...</div>;
  }

  return (
    <div className="space-y-6 font-plus-jakarta-sans">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-loubag uppercase">Gestion du Menu</h2>
        <p className="text-secondary font-plus-jakarta-sans text-lg mb-4">
          Gérez les catégories, sous-catégories, éléments de menu et add-ons du restaurant
        </p>

        {/* Editor Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setEditorMode('detailed')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              editorMode === 'detailed'
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Éditeur détaillé
          </button>
          <button
            onClick={() => setEditorMode('simple')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              editorMode === 'simple'
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Éditeur simple
          </button>
        </div>
      </div>

      {editorMode === 'simple' ? (
        <FirstTimeMenuEditor restaurant={restaurant} />
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="mb-8">
            {/* Desktop Tabs */}
            <nav className="hidden md:flex space-x-4">
              {menuTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-6 py-3 font-medium transition-all font-plus-jakarta-sans text-[13px]',
                    activeTab === tab.id
                      ? 'bg-[#F34A23] text-white scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                  style={activeTab === tab.id ? {
                    borderRadius: '0.87413rem',
                    boxShadow: '0 0 34.366px 11.988px rgba(241, 155, 135, 0.50), 0 0.999px 2.997px 0 #FDD8C7 inset'
                  } : {
                    borderRadius: '0.5rem'
                  }}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Tabs */}
            <div className="md:hidden flex flex-wrap gap-3 pb-4 px-1">
              {menuTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center justify-center py-3 px-4 transition-all min-w-[100px] cursor-pointer text-[13px]',
                    activeTab === tab.id
                      ? 'bg-[#F34A23] text-white'
                      : 'bg-gray-100 text-gray-700'
                  )}
                  style={activeTab === tab.id ? {
                    borderRadius: '0.87413rem',
                    boxShadow: '0 0 15px 5px rgba(241, 155, 135, 0.50), 0 1px 3px 0 #FDD8C7 inset'
                  } : {
                    borderRadius: '0.5rem'
                  }}
                >
                  <span className="font-medium text-center">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            {activeTab === 'categories' && <CategoriesManagement restaurantId={restaurant.id} />}
            {activeTab === 'subcategories' && <SubcategoriesManagement restaurantId={restaurant.id} />}
            {activeTab === 'items' && <MenuItemsManagement restaurantId={restaurant.id} />}
            {activeTab === 'addons' && <AddonsManagement restaurantId={restaurant.id} />}
          </div>
        </>
      )}
    </div>
  );
}
