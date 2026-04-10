/**
 * Section Editor Component
 * Dynamic editor for different section types
 */

import React from 'react';
import { X, Image, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type {
  StorefrontSection,
  StorefrontTheme,
  HeroSection,
  HeroSlide,
  ContentPosition,
  FeaturedProductsSection,
  CategoriesSection,
  AboutSection,
  TestimonialsSection,
  NewsletterSection,
  BasePageSection,
} from '../types';

interface SectionEditorProps {
  section: StorefrontSection | BasePageSection;
  theme: StorefrontTheme;
  onChange: (updates: Partial<StorefrontSection | BasePageSection>) => void;
  onClose: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  theme,
  onChange,
  onClose,
}) => {
  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return <HeroSectionEditor section={section as HeroSection} onChange={onChange} />;
      case 'featured-products':
        return <FeaturedProductsEditor section={section as FeaturedProductsSection} onChange={onChange} />;
      case 'categories':
        return <CategoriesEditor section={section as CategoriesSection} onChange={onChange} />;
      case 'about':
        return <AboutSectionEditor section={section as AboutSection} onChange={onChange} />;
      case 'testimonials':
        return <TestimonialsSectionEditor section={section as TestimonialsSection} onChange={onChange} />;
      case 'newsletter':
        return <NewsletterSectionEditor section={section as NewsletterSection} onChange={onChange} />;
      default:
        // Handle page-specific sections with a generic editor
        return <GenericSectionEditor section={section as StorefrontSection} onChange={onChange} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-medium capitalize text-slate-900">{section.type.replace(/-/g, ' ')}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>
    </div>
  );
};

// Hero Section Editor
const HeroSectionEditor: React.FC<{
  section: HeroSection;
  onChange: (updates: Partial<HeroSection>) => void;
}> = ({ section, onChange }) => {
  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      headline: 'New Slide',
      subheadline: 'Add your content here',
      ctaText: 'Shop Now',
      ctaLink: '/products',
    };
    onChange({ slides: [...(section.slides || []), newSlide] });
  };

  const updateSlide = (index: number, updates: Partial<HeroSlide>) => {
    const newSlides = [...(section.slides || [])];
    newSlides[index] = { ...newSlides[index], ...updates };
    onChange({ slides: newSlides });
  };

  const removeSlide = (index: number) => {
    const newSlides = (section.slides || []).filter((_, i) => i !== index);
    onChange({ slides: newSlides });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...(section.slides || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSlides.length) return;
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    onChange({ slides: newSlides });
  };

  return (
    <div className="space-y-4">
      {/* Variant */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout Variant</label>
        <div className="grid grid-cols-4 gap-2">
          {(['centered', 'split', 'minimal', 'slideshow'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => {
                onChange({ variant });
                // Initialize slides array when switching to slideshow
                if (variant === 'slideshow' && (!section.slides || section.slides.length === 0)) {
                  onChange({
                    variant,
                    slides: [{
                      id: 'slide-1',
                      headline: section.headline,
                      subheadline: section.subheadline,
                      ctaText: section.ctaText,
                      ctaLink: section.ctaLink,
                      backgroundImage: section.backgroundImage,
                    }],
                    autoplay: true,
                    autoplayInterval: 5,
                  });
                }
              }}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Toggle - Available for ALL variants */}
      <div className="p-3 bg-primary-lime/10 border border-primary-lime/30 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={section.useDynamicContent ?? false}
            onChange={(e) => onChange({ useDynamicContent: e.target.checked })}
            className="w-4 h-4 rounded border-primary-lime bg-white text-primary-lime focus:ring-primary-lime"
          />
          <div>
            <span className="text-sm font-medium text-primary-lime">Use Dynamic Content</span>
            <p className="text-xs text-slate-500 mt-0.5">
              {section.variant === 'slideshow'
                ? 'Show recent products as carousel slides'
                : 'Show latest product as hero background'}
            </p>
          </div>
        </label>
      </div>

      {/* Slideshow Slides Editor */}
      {section.variant === 'slideshow' ? (
        <>
          {/* Slideshow Settings */}
          <div className="p-3 bg-slate-100 rounded-lg space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={section.autoplay ?? true}
                onChange={(e) => onChange({ autoplay: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
              />
              <span className="text-sm text-slate-700">Auto-play slides</span>
            </label>
            {section.autoplay && (
              <div>
                <label className="block text-sm text-slate-500 mb-2">
                  Interval: {section.autoplayInterval || 5}s
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={section.autoplayInterval || 5}
                  onChange={(e) => onChange({ autoplayInterval: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Slides List - Only show when NOT using dynamic content */}
          {!section.useDynamicContent && (
          <div>
            <label className="block text-sm text-slate-500 mb-2">Slides</label>
            <div className="space-y-3">
              {(section.slides || []).map((slide, index) => (
                <div key={slide.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-lime">Slide {index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-500"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === (section.slides?.length || 0) - 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-500"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSlide(index)}
                        className="p-1 rounded hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={slide.headline}
                      onChange={(e) => updateSlide(index, { headline: e.target.value })}
                      placeholder="Headline"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                    />
                    <input
                      type="text"
                      value={slide.subheadline}
                      onChange={(e) => updateSlide(index, { subheadline: e.target.value })}
                      placeholder="Subheadline"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={slide.ctaText || ''}
                        onChange={(e) => updateSlide(index, { ctaText: e.target.value })}
                        placeholder="Button Text"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                      />
                      <input
                        type="text"
                        value={slide.ctaLink || ''}
                        onChange={(e) => updateSlide(index, { ctaLink: e.target.value })}
                        placeholder="Button Link"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.backgroundImage || ''}
                        onChange={(e) => updateSlide(index, { backgroundImage: e.target.value })}
                        placeholder="Background Image URL"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                      />
                      <button className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-lime text-slate-500">
                        <Image className="w-4 h-4" />
                      </button>
                    </div>
                    {slide.backgroundImage && (
                      <div className="relative h-20 rounded-lg overflow-hidden">
                        <img
                          src={slide.backgroundImage}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {(slide.overlayOpacity || 0) > 0 && (
                          <div
                            className="absolute inset-0 bg-black"
                            style={{ opacity: (slide.overlayOpacity || 0) / 100 }}
                          />
                        )}
                      </div>
                    )}
                    {/* Per-slide overlay */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Overlay: {slide.overlayOpacity || 0}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={slide.overlayOpacity || 0}
                        onChange={(e) => updateSlide(index, { overlayOpacity: parseInt(e.target.value) })}
                        className="w-full h-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addSlide}
                className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            </div>
          </div>
          )}

          {/* Info when dynamic content is enabled */}
          {section.useDynamicContent && (
            <div className="p-3 bg-slate-100 rounded-lg border border-dashed border-slate-300">
              <p className="text-sm text-slate-500">
                Slides will be automatically generated from your recent products with their images, names, descriptions, and prices.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Standard Hero Content */}
          {/* Headline */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">Headline</label>
            <input
              type="text"
              value={section.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">Subheadline</label>
            <textarea
              value={section.subheadline}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none text-slate-900 focus:outline-none focus:border-primary-lime"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-500 mb-2">Button Text</label>
              <input
                type="text"
                value={section.ctaText}
                onChange={(e) => onChange({ ctaText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-2">Button Link</label>
              <input
                type="text"
                value={section.ctaLink}
                onChange={(e) => onChange({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
              />
            </div>
          </div>

          {/* Background Type */}
          <div>
            <label className="block text-sm text-slate-500 mb-2">Background</label>
            <div className="grid grid-cols-4 gap-2">
              {(['color', 'gradient', 'image', 'video'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ backgroundType: type })}
                  className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                    section.backgroundType === type
                      ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                      : 'border-slate-300 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {section.backgroundType === 'color' && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={section.backgroundColor || '#000000'}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={section.backgroundColor || '#000000'}
                  onChange={(e) => onChange({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
                />
              </div>
            )}

            {section.backgroundType === 'gradient' && (
              <div className="mt-3">
                <textarea
                  value={section.backgroundGradient || ''}
                  onChange={(e) => onChange({ backgroundGradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none text-slate-900 focus:outline-none focus:border-primary-lime text-sm font-mono"
                />
              </div>
            )}

            {section.backgroundType === 'image' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={section.backgroundImage || ''}
                    onChange={(e) => onChange({ backgroundImage: e.target.value })}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
                  />
                  <button className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-lime transition-colors text-slate-500">
                    <Image className="w-4 h-4" />
                  </button>
                </div>
                {section.backgroundImage && (
                  <div className="h-24 rounded-lg overflow-hidden">
                    <img
                      src={section.backgroundImage}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Text Alignment */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Text Alignment</label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ textAlignment: align })}
              className={`flex-1 p-2 rounded-lg border transition-all ${
                section.textAlignment === align
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-500'
              }`}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
              {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
              {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content Position */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Content Position</label>
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 rounded-lg">
          {([
            ['top-left', 'top-center', 'top-right'],
            ['center-left', 'center', 'center-right'],
            ['bottom-left', 'bottom-center', 'bottom-right'],
          ] as ContentPosition[][]).map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((position) => {
                const isSelected = (section.contentPosition || 'center') === position;
                const labels: Record<ContentPosition, string> = {
                  'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
                  'center-left': '←', 'center': '●', 'center-right': '→',
                  'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
                };
                return (
                  <button
                    key={position}
                    onClick={() => onChange({ contentPosition: position })}
                    className={`p-2 text-sm rounded transition-all ${
                      isSelected
                        ? 'bg-primary-lime text-white'
                        : 'hover:bg-slate-200 text-slate-500'
                    }`}
                    title={position.replace('-', ' ')}
                  >
                    {labels[position]}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Position: {(section.contentPosition || 'center').replace('-', ' ')}
        </p>
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Section Height</label>
        <div className="grid grid-cols-4 gap-2">
          {(['small', 'medium', 'large', 'full'] as const).map((height) => (
            <button
              key={height}
              onClick={() => onChange({ height })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.height === height
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {height}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Opacity */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">
          Overlay Opacity: {section.overlayOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={section.overlayOpacity}
          onChange={(e) => onChange({ overlayOpacity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

// Featured Products Editor
const FeaturedProductsEditor: React.FC<{
  section: FeaturedProductsSection;
  onChange: (updates: Partial<FeaturedProductsSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Subtitle</label>
        <input
          type="text"
          value={section.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      {/* Variant */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout</label>
        <div className="grid grid-cols-4 gap-2">
          {(['grid', 'carousel', 'list', 'masonry'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Columns</label>
        <div className="grid grid-cols-4 gap-2">
          {([2, 3, 4, 5] as const).map((cols) => (
            <button
              key={cols}
              onClick={() => onChange({ columns: cols })}
              className={`p-2 text-xs rounded-lg border transition-all ${
                section.columns === cols
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {cols} cols
            </button>
          ))}
        </div>
      </div>

      {/* Limit */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Number of Products</label>
        <input
          type="number"
          min="1"
          max="24"
          value={section.limit}
          onChange={(e) => onChange({ limit: parseInt(e.target.value) || 8 })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      {/* Display Options */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Display Options</label>
        <div className="space-y-2">
          {[
            { key: 'showPrice', label: 'Show Price' },
            { key: 'showRating', label: 'Show Rating' },
            { key: 'showAddToCart', label: 'Show Add to Cart' },
          ].map((option) => (
            <label key={option.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={section[option.key as keyof FeaturedProductsSection] as boolean}
                onChange={(e) => onChange({ [option.key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Categories Editor
const CategoriesEditor: React.FC<{
  section: CategoriesSection;
  onChange: (updates: Partial<CategoriesSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Dynamic Content Toggle */}
      <div className="p-3 bg-primary-lime/10 border border-primary-lime/30 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={section.useDynamicContent ?? false}
            onChange={(e) => onChange({ useDynamicContent: e.target.checked })}
            className="w-4 h-4 rounded border-primary-lime bg-white text-primary-lime focus:ring-primary-lime"
          />
          <div>
            <span className="text-sm font-medium text-primary-lime">Use Dynamic Content</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Show categories from your shop dynamically
            </p>
          </div>
        </label>
      </div>

      {/* Info when dynamic content is enabled */}
      {section.useDynamicContent && (
        <div className="p-3 bg-slate-100 rounded-lg border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">
            Categories will be automatically loaded from the platform. The display will update based on actual categories with their images and product counts.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm text-slate-500 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Subtitle</label>
        <input
          type="text"
          value={section.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout</label>
        <div className="grid grid-cols-4 gap-2">
          {(['grid', 'carousel', 'list', 'icons'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Columns</label>
        <div className="grid grid-cols-4 gap-2">
          {([2, 3, 4, 6] as const).map((cols) => (
            <button
              key={cols}
              onClick={() => onChange({ columns: cols })}
              className={`p-2 text-xs rounded-lg border transition-all ${
                section.columns === cols
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {cols} cols
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={section.showProductCount}
          onChange={(e) => onChange({ showProductCount: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
        />
        <span className="text-sm text-slate-700">Show Product Count</span>
      </label>
    </div>
  );
};

// About Section Editor
const AboutSectionEditor: React.FC<{
  section: AboutSection;
  onChange: (updates: Partial<AboutSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-500 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Content</label>
        <textarea
          value={section.content}
          onChange={(e) => onChange({ content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {(['split', 'centered', 'timeline'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {section.variant === 'split' && (
        <div>
          <label className="block text-sm text-slate-500 mb-2">Image Position</label>
          <div className="grid grid-cols-2 gap-2">
            {(['left', 'right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onChange({ imagePosition: pos })}
                className={`p-2 text-sm rounded-lg border transition-all capitalize ${
                  section.imagePosition === pos
                    ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                    : 'border-slate-300 hover:border-slate-400 text-slate-600'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Stats</label>
        <div className="space-y-2">
          {(section.stats || []).map((stat, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => {
                  const newStats = [...(section.stats || [])];
                  newStats[index] = { ...stat, value: e.target.value };
                  onChange({ stats: newStats });
                }}
                placeholder="Value"
                className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const newStats = [...(section.stats || [])];
                  newStats[index] = { ...stat, label: e.target.value };
                  onChange({ stats: newStats });
                }}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
              />
              <button
                onClick={() => {
                  const newStats = (section.stats || []).filter((_, i) => i !== index);
                  onChange({ stats: newStats });
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newStats = [...(section.stats || []), { label: '', value: '' }];
              onChange({ stats: newStats });
            }}
            className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
          >
            <Plus className="w-4 h-4" />
            Add Stat
          </button>
        </div>
      </div>
    </div>
  );
};

// Testimonials Section Editor
const TestimonialsSectionEditor: React.FC<{
  section: TestimonialsSection;
  onChange: (updates: Partial<TestimonialsSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-500 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Subtitle</label>
        <input
          type="text"
          value={section.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {(['carousel', 'grid', 'masonry'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={section.showRating}
            onChange={(e) => onChange({ showRating: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
          />
          <span className="text-sm text-slate-700">Show Rating Stars</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={section.autoplay}
            onChange={(e) => onChange({ autoplay: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
          />
          <span className="text-sm text-slate-700">Auto-play (for carousel)</span>
        </label>
      </div>

      {/* Testimonials List */}
      <div>
        <label className="block text-sm text-slate-500 mb-2">Testimonials</label>
        <div className="space-y-3">
          {section.testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => {
                    const newTestimonials = [...section.testimonials];
                    newTestimonials[index] = { ...testimonial, name: e.target.value };
                    onChange({ testimonials: newTestimonials });
                  }}
                  placeholder="Name"
                  className="bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const newTestimonials = section.testimonials.filter((_, i) => i !== index);
                    onChange({ testimonials: newTestimonials });
                  }}
                  className="p-1 rounded hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <input
                type="text"
                value={testimonial.role || ''}
                onChange={(e) => {
                  const newTestimonials = [...section.testimonials];
                  newTestimonials[index] = { ...testimonial, role: e.target.value };
                  onChange({ testimonials: newTestimonials });
                }}
                placeholder="Role (e.g., Verified Buyer)"
                className="w-full bg-transparent text-xs text-slate-500 mb-2 focus:outline-none"
              />
              <textarea
                value={testimonial.content}
                onChange={(e) => {
                  const newTestimonials = [...section.testimonials];
                  newTestimonials[index] = { ...testimonial, content: e.target.value };
                  onChange({ testimonials: newTestimonials });
                }}
                placeholder="Review content..."
                rows={2}
                className="w-full bg-transparent text-sm text-slate-700 resize-none focus:outline-none"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newTestimonial = {
                id: `testimonial-${Date.now()}`,
                name: '',
                role: 'Verified Buyer',
                content: '',
                rating: 5,
              };
              onChange({ testimonials: [...section.testimonials, newTestimonial] });
            }}
            className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>
    </div>
  );
};

// Newsletter Section Editor
const NewsletterSectionEditor: React.FC<{
  section: NewsletterSection;
  onChange: (updates: Partial<NewsletterSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-500 mb-2">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Subtitle</label>
        <input
          type="text"
          value={section.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {(['inline', 'card', 'banner'] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                section.variant === variant
                  ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                  : 'border-slate-300 hover:border-slate-400 text-slate-600'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Placeholder Text</label>
        <input
          type="text"
          value={section.placeholder}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Button Text</label>
        <input
          type="text"
          value={section.buttonText}
          onChange={(e) => onChange({ buttonText: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-500 mb-2">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={section.backgroundColor || '#1F2937'}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
          />
          <input
            type="text"
            value={section.backgroundColor || '#1F2937'}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
          />
        </div>
      </div>
    </div>
  );
};

// Generic Section Editor (fallback)
const GenericSectionEditor: React.FC<{
  section: StorefrontSection;
  onChange: (updates: Partial<StorefrontSection>) => void;
}> = ({ section, onChange }) => {
  return (
    <div className="text-center py-8 text-slate-400">
      <p className="text-sm">Editor for this section type coming soon</p>
    </div>
  );
};

export default SectionEditor;
