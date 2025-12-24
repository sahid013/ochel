'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { Alert } from '@/components/ui/Alert';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useTranslation } from '@/contexts/LanguageContext';

interface TemplateSelectorProps {
  restaurant: Restaurant;
  onTemplateChange?: (template: string) => void;
}

export function TemplateSelector({ restaurant, onTemplateChange }: TemplateSelectorProps) {
  const { t } = useTranslation();

  const templates = [
    {
      id: 'template1',
      name: t('admin.templateSelector.templates.template1.name'),
      description: t('admin.templateSelector.templates.template1.description'),
      features: t('admin.templateSelector.templates.template1.features') as string[],
      preview: '/images/template1_preview.png',
    },
    {
      id: 'template2',
      name: t('admin.templateSelector.templates.template2.name'),
      description: t('admin.templateSelector.templates.template2.description'),
      features: t('admin.templateSelector.templates.template2.features') as string[],
      preview: '/images/template2_preview.png',
    },
    {
      id: 'template3',
      name: t('admin.templateSelector.templates.template3.name'),
      description: t('admin.templateSelector.templates.template3.description'),
      features: t('admin.templateSelector.templates.template3.features') as string[],
      preview: '/images/template3_preview.png',
    },
    {
      id: 'template4',
      name: t('admin.templateSelector.templates.template4.name'),
      description: t('admin.templateSelector.templates.template4.description'),
      features: t('admin.templateSelector.templates.template4.features') as string[],
      preview: '/images/template4_preview.png',
    },
  ];

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
      setError(err.message || t('admin.templateSelector.error') || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.templateSelector.title')}</h2>
          <p className="text-gray-600">
            {t('admin.templateSelector.subtitle')}
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          {/* View Public Menu Button - Disabled without active subscription */}
          {restaurant.is_active && (restaurant.subscription_status === 'active' || restaurant.subscription_status === 'trialing') ? (
            <a
              href={`/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
            >
              {t('admin.templateSelector.viewPublic')}
            </a>
          ) : (
            <button
              disabled
              className="px-6 py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed shadow-sm opacity-60 pointer-events-none"
              title={t('admin.templateSelector.subscribeTooltip')}
            >
              {t('admin.templateSelector.viewPublic')}
            </button>
          )}

          {/* Publish Menu Button - Goes to restaurant's subscribe page */}
          <a
            href={`/${restaurant.slug}/admin?tab=membership`}
            className="px-6 py-3 bg-[#F34A23] text-white font-medium rounded-lg hover:bg-[#d63d1a] transition-colors shadow-sm"
          >
            {t('admin.templateSelector.publish')}
          </a>
        </div>
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
                  ✓ Actif
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
                  Aperçu en direct
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
                  {saving && selectedTemplate === template.id ? 'Enregistrement...' : 'Activer'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
