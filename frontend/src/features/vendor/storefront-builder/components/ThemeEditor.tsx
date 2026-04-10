/**
 * Theme Editor Component
 * Allows customization of colors, fonts, and styling
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Square,
  Check,
  Layout,
  Grid3X3,
  Columns,
  SlidersHorizontal,
  Image,
  ShoppingCart,
} from 'lucide-react';
import type { StorefrontTheme, ThemePreset } from '../types';
import { THEME_PRESETS, FONT_OPTIONS } from '../constants';

interface ThemeEditorProps {
  theme: StorefrontTheme;
  onChange: (theme: StorefrontTheme) => void;
  onPresetSelect?: (preset: ThemePreset) => void;
}

// Layout feature icons/badges
const getLayoutFeatures = (preset: ThemePreset) => {
  const features = [];
  const lc = preset.layoutConfig;

  // Hero
  if (lc.hero.variant === 'slideshow') features.push({ icon: '🎞️', label: 'Slideshow' });
  else if (lc.hero.variant === 'split') features.push({ icon: '⬛', label: 'Split Hero' });
  else if (lc.hero.variant === 'minimal') features.push({ icon: '◻️', label: 'Minimal' });
  else if (lc.hero.variant === 'centered') features.push({ icon: '🖼️', label: 'Full Hero' });

  // Products
  if (lc.featuredProducts.variant === 'carousel') features.push({ icon: '🔄', label: 'Carousel' });
  else if (lc.featuredProducts.variant === 'masonry') features.push({ icon: '🧱', label: 'Masonry' });
  else if (lc.featuredProducts.variant === 'grid') features.push({ icon: '⊞', label: 'Grid' });
  else if (lc.featuredProducts.variant === 'list') features.push({ icon: '☰', label: 'List' });

  // Filters
  if (lc.collection.filterPosition === 'sidebar') features.push({ icon: '◫', label: 'Sidebar' });
  else if (lc.collection.filterPosition === 'top') features.push({ icon: '▬', label: 'Top Filters' });
  else if (lc.collection.filterPosition === 'drawer') features.push({ icon: '📱', label: 'Drawer' });

  return features.slice(0, 3);
};

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, onPresetSelect }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'style'>('presets');

  const updateTheme = (updates: Partial<StorefrontTheme>) => {
    onChange({ ...theme, ...updates });
  };

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'presets', label: 'Presets' },
          { id: 'colors', label: 'Colors' },
          { id: 'typography', label: 'Typography' },
          { id: 'style', label: 'Style' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-lime text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            Choose a theme preset to get started
          </p>
          <div className="grid grid-cols-2 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = theme.id === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onChange(preset.theme);
                    onPresetSelect?.(preset);
                  }}
                  className={`relative p-3 rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'border-primary-lime bg-primary-lime/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-lime flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Theme Preview Box */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg mb-2 flex flex-col overflow-hidden border border-slate-200"
                    style={{ backgroundColor: preset.theme.backgroundColor }}
                  >
                    {/* Mini header */}
                    <div
                      className="h-3 w-full"
                      style={{ backgroundColor: preset.theme.primaryColor }}
                    />
                    {/* Mini content area */}
                    <div className="flex-1 p-1.5 flex gap-1">
                      <div
                        className="w-1/3 rounded-sm"
                        style={{ backgroundColor: preset.theme.secondaryColor, opacity: 0.3 }}
                      />
                      <div className="w-2/3 space-y-1">
                        <div
                          className="h-2 w-full rounded-sm"
                          style={{ backgroundColor: preset.theme.textColor, opacity: 0.2 }}
                        />
                        <div
                          className="h-1.5 w-3/4 rounded-sm"
                          style={{ backgroundColor: preset.theme.textColor, opacity: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme Name */}
                  <p className="font-medium text-slate-900 text-sm truncate">{preset.name}</p>

                  {/* Color swatches */}
                  <div className="flex justify-center gap-1 mt-2">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: preset.theme.primaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: preset.theme.secondaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: preset.theme.accentColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          {[
            { key: 'primaryColor', label: 'Primary Color', desc: 'Buttons, links, accents' },
            { key: 'secondaryColor', label: 'Secondary Color', desc: 'Secondary buttons, highlights' },
            { key: 'accentColor', label: 'Accent Color', desc: 'Special highlights' },
            { key: 'backgroundColor', label: 'Background', desc: 'Page background' },
            { key: 'textColor', label: 'Text Color', desc: 'Body text' },
          ].map((colorField) => (
            <div key={colorField.key}>
              <label className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-slate-700">{colorField.label}</span>
                  <p className="text-xs text-slate-400">{colorField.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[colorField.key as keyof StorefrontTheme] as string}
                    onChange={(e) => updateTheme({ [colorField.key]: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={theme[colorField.key as keyof StorefrontTheme] as string}
                    onChange={(e) => updateTheme({ [colorField.key]: e.target.value })}
                    className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Heading Font</label>
            <select
              value={theme.headingFont}
              onChange={(e) => updateTheme({ headingFont: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label} ({font.category})
                </option>
              ))}
            </select>
            <p
              className="mt-2 text-lg text-slate-700"
              style={{ fontFamily: theme.headingFont }}
            >
              The quick brown fox
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Body Font</label>
            <select
              value={theme.bodyFont}
              onChange={(e) => updateTheme({ bodyFont: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-lime"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label} ({font.category})
                </option>
              ))}
            </select>
            <p
              className="mt-2 text-sm text-slate-600"
              style={{ fontFamily: theme.bodyFont }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-6">
          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Border Radius</label>
            <div className="grid grid-cols-5 gap-2">
              {(['none', 'small', 'medium', 'large', 'full'] as const).map((radius) => (
                <button
                  key={radius}
                  onClick={() => updateTheme({ borderRadius: radius })}
                  className={`p-3 rounded-lg border transition-all ${
                    theme.borderRadius === radius
                      ? 'border-primary-lime bg-primary-lime/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-full aspect-square bg-slate-300 ${
                      radius === 'none' ? 'rounded-none' :
                      radius === 'small' ? 'rounded-sm' :
                      radius === 'medium' ? 'rounded-lg' :
                      radius === 'large' ? 'rounded-2xl' :
                      'rounded-full'
                    }`}
                  />
                  <p className="text-xs text-center mt-1 capitalize text-slate-600">{radius}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Button Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'outline', 'ghost'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateTheme({ buttonStyle: style })}
                  className={`p-3 rounded-lg border transition-all ${
                    theme.buttonStyle === style
                      ? 'border-primary-lime bg-primary-lime/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      style === 'solid' ? 'bg-primary-lime text-white' :
                      style === 'outline' ? 'border border-primary-lime text-primary-lime' :
                      'text-primary-lime hover:bg-primary-lime/10'
                    }`}
                  >
                    Button
                  </div>
                  <p className="text-xs text-center mt-2 capitalize text-slate-600">{style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Card Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['flat', 'elevated', 'bordered'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateTheme({ cardStyle: style })}
                  className={`p-3 rounded-lg border transition-all ${
                    theme.cardStyle === style
                      ? 'border-primary-lime bg-primary-lime/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`h-12 rounded-lg bg-slate-100 ${
                      style === 'flat' ? '' :
                      style === 'elevated' ? 'shadow-lg shadow-slate-200' :
                      'border border-slate-200'
                    }`}
                  />
                  <p className="text-xs text-center mt-2 capitalize text-slate-600">{style}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeEditor;
