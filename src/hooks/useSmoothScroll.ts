'use client';

import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    console.log('Smooth scroll hook initialized');

    // Override all anchor link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (link) {
        console.log('Hash link clicked:', link.href);
        e.preventDefault();
        
        const targetId = link.getAttribute('href')?.substring(1);
        const targetElement = targetId ? document.getElementById(targetId) : null;
        
        if (targetElement) {
          console.log('Scrolling to element:', targetElement);
          
          // Use native smooth scroll first
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    // Attach to document
    document.addEventListener('click', handleLinkClick);
    
    // Also make sure CSS smooth scroll is enabled
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);
};