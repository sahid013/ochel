'use client';

import { Restaurant } from '@/types';
import { getTemplateVariables } from '@/lib/dynamicStyles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface NavigationProps {
  restaurant: Restaurant;
  // Optional override for preview/demo purposes
  demoLogo?: string;
}

export default function Navigation({ restaurant, demoLogo }: NavigationProps) {
  const { t } = useTranslation();
  const variableStyles = getTemplateVariables(restaurant);

  // Use the demo logo if provided, otherwise fallback to restaurant logo
  const logoSrc = demoLogo || restaurant.logo_url;

  // Contact email fallback
  const contactEmail = restaurant.email;

  return (
    <nav className="relative z-50 bg-white border-b border-gray-100 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left: Logo or Name */}
          <div className="flex-shrink-0 flex items-center">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={restaurant.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                {restaurant.name}
              </span>
            )}
          </div>

          {/* Right: Contact Button */}
          <div className="flex items-center">
            <a
              href={`mailto:${contactEmail}`}
              className={cn(
                "inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold transition-colors",
                // Dynamic border radius matching template styles
                restaurant.template === 'template1' ? 'rounded-lg' :
                  restaurant.template === 'template2' ? 'rounded-xl' :
                    restaurant.template === 'template3' ? 'rounded-full' :
                      restaurant.template === 'template4' ? 'rounded-2xl' :
                        'rounded-lg', // Default fallback
                // Fallback styles if variables aren't set
                "bg-[#F34A23] text-white hover:opacity-90",
                "shadow-sm hover:shadow-md"
              )}
              style={{
                // Apply dynamic primary color
                backgroundColor: 'var(--pixel-primary, #F34A23)',
                color: 'white',
                ...variableStyles
              }}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
