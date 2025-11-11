'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

// Global reference for opening the popup
let openDeliveryPopupGlobal: (() => void) | null = null;

export const openDeliveryPopup = () => {
  if (openDeliveryPopupGlobal) {
    openDeliveryPopupGlobal();
  }
};

export function DeliveryPopup() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Set up global reference and event listener
  useEffect(() => {
    const handleOpen = () => {
      console.log('Delivery popup event received'); // Debug log
      setIsVisible(true);
      setTimeout(() => setIsOpen(true), 10); // Small delay for animation
    };

    // Set global reference
    openDeliveryPopupGlobal = handleOpen;

    // Also listen for custom events as backup
    const handleDeliveryEvent = () => {
      handleOpen();
    };

    document.addEventListener('openDeliveryPopup', handleDeliveryEvent);

    return () => {
      openDeliveryPopupGlobal = null;
      document.removeEventListener('openDeliveryPopup', handleDeliveryEvent);
    };
  }, []);

  // Handle close animation
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setIsVisible(false), 300); // Wait for animation to complete
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={handleClose}
      />

      {/* Popup content */}
      <div
        ref={popupRef}
        className={`transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          display: 'flex',
          padding: '2rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.5rem',
          borderRadius: '0.75rem',
          background: '#101010',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          minWidth: '400px',
          maxWidth: '500px',
          position: 'relative',
          transformOrigin: 'center'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-[#d4af37] transition-colors"
          style={{ fontSize: '1.5rem', lineHeight: 1 }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          color: '#FFF2CC',
          fontFamily: 'Forum',
          fontSize: '1.5rem',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '1.8rem',
          textTransform: 'uppercase'
        }}>
          {t('delivery.title')}
        </h2>

        {/* Description */}
        <p style={{
          color: 'rgba(234, 234, 234, 0.70)',
          fontFamily: 'Forum',
          fontSize: '1rem',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '1.40625rem'
        }}>
          {t('delivery.description')}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={() => window.open('https://www.ubereats.com/fr/store/magnifiko/KZMzirofRcaWBMZN9TWreA?srsltid=AfmBOoqmzepjgRkylRxN0rPgdv14UGlGR-omHI3ugZUQQNotbxsIxKj9', '_blank')}
            style={{
              display: 'flex',
              height: '2.5rem',
              padding: '0 2rem',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '0.625rem',
              background: '#FFF2CC',
              color: '#000',
              fontFamily: 'Forum',
              fontSize: '1rem',
              fontWeight: 400,
              border: 'none',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Uber Eats
          </button>
          <button
            onClick={() => window.open('https://deliveroo.fr/fr/menu/Paris/ivry-sur-seine-centre/love-pizza-ivry', '_blank')}
            style={{
              display: 'flex',
              height: '2.5rem',
              padding: '0 2rem',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '0.625rem',
              background: '#FFF2CC',
              color: '#000',
              fontFamily: 'Forum',
              fontSize: '1rem',
              fontWeight: 400,
              border: 'none',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Deliveroo
          </button>
        </div>
      </div>
    </div>
  );
}