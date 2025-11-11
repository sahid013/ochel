'use client';

import { useEffect } from 'react';
import { menuService } from '@/services/menuService';
import { PublicFooter } from '@/components/common/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Fetch menu data on mount if not already cached
    const fetchMenuData = async () => {
      try {
        // Check if data is already in sessionStorage
        const cachedData = sessionStorage.getItem('menuData');

        if (!cachedData) {
          const allMenuData = await menuService.getAllMenuData();
          // Store in sessionStorage for the session
          sessionStorage.setItem('menuData', JSON.stringify(Array.from(allMenuData.entries())));
          console.log('Menu data fetched and cached');
        } else {
          console.log('Using cached menu data');
        }
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <>
      {children}
      <PublicFooter />
    </>
  );
}
