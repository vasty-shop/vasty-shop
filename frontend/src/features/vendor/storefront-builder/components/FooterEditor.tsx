/**
 * Footer Editor Component
 * Allows customization of the storefront footer
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import type { StorefrontFooter } from '../types';

interface FooterEditorProps {
  footer: StorefrontFooter;
  onChange: (footer: StorefrontFooter) => void;
  onClose: () => void;
}

export const FooterEditor: React.FC<FooterEditorProps> = ({
  footer,
  onChange,
  onClose,
}) => {
  const { t } = useTranslation();
  const updateFooter = (updates: Partial<StorefrontFooter>) => {
    onChange({ ...footer, ...updates });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Footer Settings</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Layout Variant */}
        <div>
          <label className="block text-sm text-slate-500 mb-2">Layout</label>
          <div className="grid grid-cols-2 gap-2">
            {(['simple', 'columns', 'minimal', 'centered'] as const).map((variant) => (
              <button
                key={variant}
                onClick={() => updateFooter({ variant })}
                className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                  footer.variant === variant
                    ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                    : 'border-slate-300 hover:border-slate-400 text-slate-600'
                }`}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div>
          <label className="block text-sm text-slate-500 mb-3">Display Options</label>
          <div className="space-y-3">
            {[
              { key: 'showLogo', label: 'Show Logo' },
              { key: 'showSocial', label: 'Show Social Links' },
              { key: 'showNewsletter', label: 'Show Newsletter' },
              { key: 'showPaymentIcons', label: 'Show Payment Icons' },
            ].map((option) => (
              <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footer[option.key as keyof StorefrontFooter] as boolean}
                  onChange={(e) => updateFooter({ [option.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Copyright Text */}
        <div>
          <label className="block text-sm text-slate-500 mb-2">Copyright Text</label>
          <input
            type="text"
            value={footer.copyrightText}
            onChange={(e) => updateFooter({ copyrightText: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
          />
        </div>

        {/* Link Columns */}
        {footer.variant === 'columns' && (
          <div>
            <label className="block text-sm text-slate-500 mb-3">Link Columns</label>
            <div className="space-y-4">
              {footer.columns.map((column, colIndex) => (
                <div key={column.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => {
                        const newColumns = [...footer.columns];
                        newColumns[colIndex] = { ...column, title: e.target.value };
                        updateFooter({ columns: newColumns });
                      }}
                      placeholder={t('vendor.placeholders.columnTitle')}
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                    />
                    <button
                      onClick={() => {
                        const newColumns = footer.columns.filter((_, i) => i !== colIndex);
                        updateFooter({ columns: newColumns });
                      }}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newColumns = [...footer.columns];
                            const newLinks = [...column.links];
                            newLinks[linkIndex] = { ...link, label: e.target.value };
                            newColumns[colIndex] = { ...column, links: newLinks };
                            updateFooter({ columns: newColumns });
                          }}
                          placeholder={t('vendor.placeholders.linkLabel')}
                          className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-primary-lime"
                        />
                        <input
                          type="text"
                          value={link.link}
                          onChange={(e) => {
                            const newColumns = [...footer.columns];
                            const newLinks = [...column.links];
                            newLinks[linkIndex] = { ...link, link: e.target.value };
                            newColumns[colIndex] = { ...column, links: newLinks };
                            updateFooter({ columns: newColumns });
                          }}
                          placeholder="/link"
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-primary-lime"
                        />
                        <button
                          onClick={() => {
                            const newColumns = [...footer.columns];
                            const newLinks = column.links.filter((_, i) => i !== linkIndex);
                            newColumns[colIndex] = { ...column, links: newLinks };
                            updateFooter({ columns: newColumns });
                          }}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newColumns = [...footer.columns];
                        const newLinks = [...column.links, { label: '', link: '/' }];
                        newColumns[colIndex] = { ...column, links: newLinks };
                        updateFooter({ columns: newColumns });
                      }}
                      className="flex items-center gap-1 text-xs text-primary-lime hover:text-primary-lime/80"
                    >
                      <Plus className="w-3 h-3" />
                      Add Link
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColumn = {
                    id: `col-${Date.now()}`,
                    title: 'New Column',
                    links: [],
                  };
                  updateFooter({ columns: [...footer.columns, newColumn] });
                }}
                className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>
          </div>
        )}

        {/* Social Links */}
        {footer.showSocial && (
          <div>
            <label className="block text-sm text-slate-500 mb-3">Social Links</label>
            <div className="space-y-2">
              {footer.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...footer.socialLinks];
                      newLinks[index] = {
                        ...link,
                        platform: e.target.value as typeof link.platform,
                      };
                      updateFooter({ socialLinks: newLinks });
                    }}
                    className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                  >
                    {['facebook', 'twitter', 'instagram', 'youtube', 'tiktok', 'linkedin'].map(
                      (platform) => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...footer.socialLinks];
                      newLinks[index] = { ...link, url: e.target.value };
                      updateFooter({ socialLinks: newLinks });
                    }}
                    placeholder="https://..."
                    className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                  />
                  <button
                    onClick={() => {
                      const newLinks = footer.socialLinks.filter((_, i) => i !== index);
                      updateFooter({ socialLinks: newLinks });
                    }}
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newLink = { platform: 'facebook' as const, url: '' };
                  updateFooter({ socialLinks: [...footer.socialLinks, newLink] });
                }}
                className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
              >
                <Plus className="w-4 h-4" />
                Add Social Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterEditor;
