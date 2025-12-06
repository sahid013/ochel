import React from 'react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  href?: string;
  size?: 'default' | 'sm';
  variant?: 'primary' | 'secondary';
  target?: string;
  rel?: string;
}

/**
 * Reusable button component with glowing effect
 * Uses Plus Jakarta Sans font and Ochel brand colors
 * Supports default and small (sm) sizes
 * Supports primary (filled) and secondary (outline) variants
 */
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
  href,
  size = 'default',
  variant = 'primary',
  target,
  rel,
}: PrimaryButtonProps) {
  // Size-specific classes - secondary variant has reduced padding to compensate for 2px border
  const getSizeClasses = () => {
    if (size === 'sm') {
      // sm size: reduce padding for secondary to compensate for border
      return variant === 'secondary' ? 'px-4 py-1.5 text-base' : 'px-4 py-2 text-base';
    } else {
      // default size: reduce padding for secondary to compensate for border
      return variant === 'secondary' ? 'px-6 py-2.5' : 'px-6 py-3';
    }
  };

  // Variant-specific classes
  const variantClasses = variant === 'secondary'
    ? 'bg-transparent border-2 border-[#F34A23] text-[#F34A23] hover:bg-[#F34A23] hover:text-white disabled:border-gray-400 disabled:text-gray-400'
    : 'bg-[#F34A23] text-white hover:bg-[#d63d1a] disabled:bg-gray-400';

  const baseClasses = cn(
    fullWidth ? 'w-full' : '',
    getSizeClasses(),
    variantClasses,
    'inline-flex items-center justify-center font-semibold disabled:cursor-not-allowed transition-colors font-plus-jakarta-sans',
    className
  );

  const buttonStyle = {
    borderRadius: '0.87413rem',
    // Only apply glowing shadow to primary variant when not disabled
    boxShadow: variant === 'primary' && !disabled
      ? '0 0 34.366px 11.988px rgba(241, 155, 135, 0.50), 0 0.999px 2.997px 0 #FDD8C7 inset'
      : 'none',
    // Ensure border color is applied for secondary variant (overrides global border-color)
    ...(variant === 'secondary' && { borderColor: '#F34A23' })
  };

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        style={buttonStyle}
        onClick={onClick}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      style={buttonStyle}
    >
      {children}
    </button>
  );
}
