'use client';

import { useEffect, useRef } from 'react';

export const usePhysicsScroll = () => {
  const isScrollingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    let animationId: number;
    
    // Physics constants
    const FRICTION = 0.92; // How quickly momentum decreases (0.8-0.95)
    const ACCELERATION = 0.15; // How responsive to new scroll input (0.1-0.3)
    const MIN_VELOCITY = 0.5; // Minimum velocity before stopping

    const smoothScroll = () => {
      const target = targetScrollRef.current;
      const current = currentScrollRef.current;
      const diff = target - current;
      
      // Apply physics: velocity and friction
      velocityRef.current += diff * ACCELERATION;
      velocityRef.current *= FRICTION;
      
      // Update position
      currentScrollRef.current += velocityRef.current;
      
      // Actually scroll the page
      window.scrollTo(0, currentScrollRef.current);
      
      // Continue animation if there's significant movement
      if (Math.abs(velocityRef.current) > MIN_VELOCITY || Math.abs(diff) > 1) {
        animationId = requestAnimationFrame(smoothScroll);
      } else {
        isScrollingRef.current = false;
        currentScrollRef.current = target;
        window.scrollTo(0, target);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Update target scroll position
      const scrollSensitivity = 2; // Adjust this to control scroll speed
      targetScrollRef.current += e.deltaY * scrollSensitivity;
      
      // Clamp to valid scroll range
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollRef.current = Math.max(0, Math.min(targetScrollRef.current, maxScroll));
      
      // Start physics animation if not already running
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        currentScrollRef.current = window.pageYOffset;
        animationId = requestAnimationFrame(smoothScroll);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Initialize for touch scrolling
      lastScrollTimeRef.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Handle touch scrolling with physics
      const now = Date.now();
      const deltaTime = now - lastScrollTimeRef.current;
      
      if (deltaTime > 0) {
        const touch = e.touches[0];
        // You can implement touch-based scrolling here if needed
      }
      
      lastScrollTimeRef.current = now;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle keyboard scrolling (arrow keys, page up/down, etc.)
      const scrollAmount = 100;
      let deltaY = 0;
      
      switch (e.key) {
        case 'ArrowDown':
          deltaY = scrollAmount;
          break;
        case 'ArrowUp':
          deltaY = -scrollAmount;
          break;
        case 'PageDown':
          deltaY = window.innerHeight * 0.8;
          break;
        case 'PageUp':
          deltaY = -window.innerHeight * 0.8;
          break;
        case 'Home':
          targetScrollRef.current = 0;
          break;
        case 'End':
          targetScrollRef.current = document.documentElement.scrollHeight - window.innerHeight;
          break;
        default:
          return; // Don't prevent default for other keys
      }
      
      if (deltaY !== 0) {
        e.preventDefault();
        
        targetScrollRef.current += deltaY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetScrollRef.current = Math.max(0, Math.min(targetScrollRef.current, maxScroll));
        
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          currentScrollRef.current = window.pageYOffset;
          animationId = requestAnimationFrame(smoothScroll);
        }
      }
    };

    // Initialize current scroll position
    currentScrollRef.current = window.pageYOffset;
    targetScrollRef.current = window.pageYOffset;

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    // Prevent default scroll behavior
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      // Cleanup
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Restore default scroll behavior
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
};