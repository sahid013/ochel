'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CategoriesManagement } from './menu/CategoriesManagement';
import { SubcategoriesManagement } from './menu/SubcategoriesManagement';
import { MenuItemsManagement } from './menu/MenuItemsManagement';
import { AddonsManagement } from './menu/AddonsManagement';

const menuTabs = [
  { id: 'categories', label: 'Catégories', icon: '📁' },
  { id: 'subcategories', label: 'Sous-catégories', icon: '📂' },
  { id: 'items', label: 'Éléments de menu', icon: '🍽️' },
  { id: 'addons', label: 'Add-ons', icon: '➕' },
];

export function MenuManagementTab() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="space-y-6 font-forum">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion du Menu</h2>
        <p className="text-gray-600">
          Gérez les catégories, sous-catégories, éléments de menu et add-ons du restaurant
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        {/* Desktop Tabs */}
        <nav className="hidden md:flex -mb-px space-x-8">
          {menuTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors rounded-t-lg cursor-pointer',
                activeTab === tab.id
                  ? 'border-[#F34A23] text-[#F34A23] bg-[#F34A23]/5'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-[#F34A23]/30 hover:bg-[#F34A23]/5'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto scrollbar-hide">
          {menuTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center py-3 px-4 border-b-2 transition-colors min-w-[100px] cursor-pointer',
                activeTab === tab.id
                  ? 'border-[#F34A23] text-[#F34A23] bg-[#F34A23]/5'
                  : 'border-transparent text-gray-600'
              )}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        {activeTab === 'categories' && <CategoriesManagement />}
        {activeTab === 'subcategories' && <SubcategoriesManagement />}
        {activeTab === 'items' && <MenuItemsManagement />}
        {activeTab === 'addons' && <AddonsManagement />}
      </div>
    </div>
  );
}
