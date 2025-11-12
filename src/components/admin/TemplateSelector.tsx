'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { Alert } from '@/components/ui/Alert';

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
    preview: '/images/template1-preview.png', // You'll add this image
  },
  {
    id: 'template2',
    name: 'Modern Light',
    description: 'Clean, bright design with minimalist aesthetics',
    features: ['Light background', 'Card-based layout', 'Mobile-optimized', 'Fast loading'],
    preview: '/images/template2-preview.png',
  },
  {
    id: 'template3',
    name: 'Boutique',
    description: 'Stylish template with elegant typography and spacing',
    features: ['Custom fonts', 'Spacious layout', 'Premium feel', 'Category highlights'],
    preview: '/images/template3-preview.png',
  },
  {
    id: 'template4',
    name: 'Casual Dining',
    description: 'Friendly, approachable design for casual restaurants',
    features: ['Colorful accents', 'Grid layout', 'Photo-focused', 'Social media integration'],
    preview: '/images/template4-preview.png',
  },
];

export default function TemplateSelector({ restaurant, onTemplateChange }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(restaurant.template || 'template1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // Update restaurant template in database
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ template: templateId })
        .eq('id', restaurant.id);

      if (updateError) throw updateError;

      setSuccess(true);
      if (onTemplateChange) {
        onTemplateChange(templateId);
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
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
          View Public Menu →
        </a>
      </div>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <p className="text-sm text-green-800">✓ Template updated successfully!</p>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
              selectedTemplate === template.id
                ? 'border-[#F34A23] shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            {/* Preview Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
              {/* Add actual preview images later */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {template.id === 'template1' && '🌙'}
                    {template.id === 'template2' && '☀️'}
                    {template.id === 'template3' && '✨'}
                    {template.id === 'template4' && '🍔'}
                  </div>
                  <p className="text-sm text-gray-500">Preview</p>
                </div>
              </div>

              {/* Selected Badge */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-[#F34A23] text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Active
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>

              {/* Features */}
              <div className="space-y-1">
                {template.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700">
                    <span className="text-[#F34A23] mr-2">•</span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {/* Preview Button */}
                <a
                  href={`/${restaurant.slug}?preview=${template.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full py-2 px-4 rounded-lg font-medium text-center border-2 border-[#F34A23] text-[#F34A23] hover:bg-[#F34A23] hover:text-white transition-colors"
                >
                  Preview Live →
                </a>

                {/* Select Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template.id);
                  }}
                  disabled={saving && selectedTemplate === template.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-[#F34A23] text-white hover:bg-[#d63d1a]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {saving && selectedTemplate === template.id
                    ? 'Saving...'
                    : selectedTemplate === template.id
                    ? 'Current Template'
                    : 'Activate Template'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
