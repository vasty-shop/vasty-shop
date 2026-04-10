/**
 * SEO Editor Component
 * Allows customization of SEO settings
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Image, X, Plus } from 'lucide-react';
import type { StorefrontSEO } from '../types';

interface SEOEditorProps {
  seo: StorefrontSEO;
  onChange: (seo: StorefrontSEO) => void;
}

export const SEOEditor: React.FC<SEOEditorProps> = ({ seo, onChange }) => {
  const { t } = useTranslation();
  const updateSEO = (updates: Partial<StorefrontSEO>) => {
    onChange({ ...seo, ...updates });
  };

  // Calculate character counts and limits
  const titleLength = seo.title.length;
  const descriptionLength = seo.description.length;
  const titleLimit = 60;
  const descriptionLimit = 160;

  return (
    <div className="p-4 space-y-6">
      {/* Title */}
      <div>
        <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Search className="w-4 h-4" />
          Page Title
        </label>
        <input
          type="text"
          value={seo.title}
          onChange={(e) => updateSEO({ title: e.target.value })}
          maxLength={70}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-400">Recommended: 50-60 characters</p>
          <p
            className={`text-xs ${
              titleLength > titleLimit ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            {titleLength}/{titleLimit}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Globe className="w-4 h-4" />
          Meta Description
        </label>
        <textarea
          value={seo.description}
          onChange={(e) => updateSEO({ description: e.target.value })}
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none text-slate-900 focus:outline-none focus:border-primary-lime"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-400">Recommended: 150-160 characters</p>
          <p
            className={`text-xs ${
              descriptionLength > descriptionLimit ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            {descriptionLength}/{descriptionLimit}
          </p>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Keywords</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {seo.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700"
            >
              {keyword}
              <button
                onClick={() => {
                  const newKeywords = seo.keywords.filter((_, i) => i !== index);
                  updateSEO({ keywords: newKeywords });
                }}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('vendor.placeholders.addKeyword')}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const value = input.value.trim();
                if (value && !seo.keywords.includes(value)) {
                  updateSEO({ keywords: [...seo.keywords, value] });
                  input.value = '';
                }
              }
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Press Enter to add</p>
      </div>

      {/* OG Image */}
      <div>
        <label className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Image className="w-4 h-4" />
          Social Share Image (OG Image)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={seo.ogImage || ''}
            onChange={(e) => updateSEO({ ogImage: e.target.value })}
            placeholder="https://..."
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
          />
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:border-primary-lime transition-colors text-slate-500">
            <Image className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">Recommended: 1200x630 pixels</p>
      </div>

      {/* Favicon */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Favicon</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={seo.favicon || ''}
            onChange={(e) => updateSEO({ favicon: e.target.value })}
            placeholder="https://..."
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
          />
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:border-primary-lime transition-colors text-slate-500">
            <Image className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">Recommended: 32x32 or 64x64 pixels</p>
      </div>

      {/* Search Preview */}
      <div>
        <label className="block text-sm text-slate-500 mb-3">Search Preview</label>
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Globe className="w-4 h-4" />
            <span>yourstore.com</span>
          </div>
          <h3
            className="text-lg text-blue-700 hover:underline cursor-pointer truncate"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {seo.title || 'Page Title'}
          </h3>
          <p
            className="text-sm text-slate-600 line-clamp-2"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {seo.description || 'Meta description will appear here...'}
          </p>
        </div>
      </div>

      {/* Social Preview */}
      <div>
        <label className="block text-sm text-slate-500 mb-3">Social Share Preview</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* OG Image Preview */}
          <div className="aspect-[1200/630] bg-slate-100 flex items-center justify-center">
            {seo.ogImage ? (
              <img
                src={seo.ogImage}
                alt="OG Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-sm">No image set</div>
            )}
          </div>
          <div className="p-3 bg-slate-50">
            <p className="text-xs text-slate-400 uppercase mb-1">yourstore.com</p>
            <h4 className="font-medium text-sm text-slate-900 truncate">{seo.title || 'Page Title'}</h4>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
              {seo.description || 'Description...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOEditor;
