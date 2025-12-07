'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { Alert } from '@/components/ui/Alert';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface TemplateSelectorProps {
  restaurant: Restaurant;
  onTemplateChange?: (template: string) => void;
}

const templates = [
  {
    id: 'template1',
    name: 'Classic Dark',
    description: 'Elegant dark theme with split layout - perfect for fine dining',
    features: ['Dark background', 'Split-screen design', 'Image gallery support', '3D model integration'],
    preview: '/images/template1_preview.png',
  },
  {
    id: 'template2',
    name: 'Modern Light',
    description: 'Clean, bright design with minimalist aesthetics',
    features: ['Light background', 'Card-based layout', 'Mobile-optimized', 'Fast loading'],
    preview: '/images/template2_preview.png',
  },
  {
    id: 'template3',
    name: 'Boutique',
    description: 'Stylish template with elegant typography and spacing',
    features: ['Custom fonts', 'Spacious layout', 'Premium feel', 'Category highlights'],
    preview: '/images/template3_preview.png',
  },
  {
    id: 'template4',
    name: 'Casual Dining',
    description: 'Friendly, approachable design for casual restaurants',
    features: ['Colorful accents', 'Grid layout', 'Photo-focused', 'Social media integration'],
    preview: '/images/template4_preview.png',
  },
];

export function TemplateSelector({ restaurant, onTemplateChange }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(restaurant.template || 'template1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setError(null);
    setSaving(true);

    try {
      // Update restaurant template in database
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ template: templateId } as any)
        .eq('id', restaurant.id);

      if (updateError) throw updateError;

      if (onTemplateChange) {
        onTemplateChange(templateId);
      }
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Menu Template</h2>
          <p className="text-gray-600">
            Select the template that best represents your restaurant's style. Use "Preview Live" to test each template before activating it.
          </p>
        </div>
        <a
          href={`/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-6 py-3 bg-[#F34A23] text-white font-medium rounded-lg hover:bg-[#d63d1a] transition-colors shadow-sm"
        >
          View Public Menu
        </a>
      </div>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border rounded-xl overflow-hidden transition-all cursor-pointer bg-white ${selectedTemplate === template.id
              ? 'border-2 border-[#F34A23]'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            {/* Preview Image */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden group">
              <img
                src={template.preview}
                alt={`${template.name} Preview`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-[#F34A23] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                  ✓ Active
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Preview Button */}
                <PrimaryButton
                  href={`/${restaurant.slug}?preview=${template.id}`}
                  variant="secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e && e.stopPropagation()}
                  className="flex-1 justify-center"
                >
                  Preview Live
                </PrimaryButton>

                {/* Select Button */}
                <PrimaryButton
                  onClick={(e) => {
                    if (e) e.stopPropagation();
                    handleSelectTemplate(template.id);
                  }}
                  disabled={saving || selectedTemplate === template.id}
                  variant="primary"
                  className={`flex-1 justify-center ${selectedTemplate === template.id ? 'disabled:bg-[#F34A23] disabled:opacity-50 disabled:text-white' : ''
                    }`}
                >
                  {saving && selectedTemplate === template.id ? 'Saving...' : 'Activate'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
