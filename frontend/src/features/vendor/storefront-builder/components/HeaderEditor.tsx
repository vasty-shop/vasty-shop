/**
 * Header Editor Component
 * Allows customization of the storefront header
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import type { StorefrontHeader } from '../types';

interface HeaderEditorProps {
  header: StorefrontHeader;
  onChange: (header: StorefrontHeader) => void;
  onClose: () => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  onChange,
  onClose,
}) => {
  const { t } = useTranslation();
  const updateHeader = (updates: Partial<StorefrontHeader>) => {
    onChange({ ...header, ...updates });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Header Settings</h3>
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
            {(['centered', 'left', 'split', 'minimal'] as const).map((variant) => (
              <button
                key={variant}
                onClick={() => updateHeader({ variant })}
                className={`p-2 text-xs rounded-lg border transition-all capitalize ${
                  header.variant === variant
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
              { key: 'showSearch', label: 'Show Search' },
              { key: 'showCart', label: 'Show Cart' },
              { key: 'showAccount', label: 'Show Account' },
              { key: 'sticky', label: 'Sticky Header' },
              { key: 'transparent', label: 'Transparent Background' },
            ].map((option) => (
              <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={header[option.key as keyof StorefrontHeader] as boolean}
                  onChange={(e) => updateHeader({ [option.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div>
          <label className="block text-sm text-slate-500 mb-3">Menu Items</label>
          <div className="space-y-2">
            {header.menuItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...header.menuItems];
                    newItems[index] = { ...item, label: e.target.value };
                    updateHeader({ menuItems: newItems });
                  }}
                  placeholder={t('vendor.placeholders.linkLabel')}
                  className="flex-1 px-2 py-1 bg-transparent text-sm text-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  value={item.link}
                  onChange={(e) => {
                    const newItems = [...header.menuItems];
                    newItems[index] = { ...item, link: e.target.value };
                    updateHeader({ menuItems: newItems });
                  }}
                  placeholder="/link"
                  className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-primary-lime"
                />
                <button
                  onClick={() => {
                    const newItems = header.menuItems.filter((_, i) => i !== index);
                    updateHeader({ menuItems: newItems });
                  }}
                  className="p-1 rounded hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem = {
                  id: `menu-${Date.now()}`,
                  label: 'New Link',
                  link: '/',
                };
                updateHeader({ menuItems: [...header.menuItems, newItem] });
              }}
              className="flex items-center gap-2 text-sm text-primary-lime hover:text-primary-lime/80"
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Announcement Bar */}
        <div>
          <label className="flex items-center gap-3 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={header.announcementBar?.enabled ?? false}
              onChange={(e) =>
                updateHeader({
                  announcementBar: {
                    ...header.announcementBar!,
                    enabled: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-slate-300 bg-white text-primary-lime focus:ring-primary-lime"
            />
            <span className="text-sm text-slate-500">Announcement Bar</span>
          </label>

          {header.announcementBar?.enabled && (
            <div className="space-y-3 pl-7">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Text</label>
                <input
                  type="text"
                  value={header.announcementBar.text}
                  onChange={(e) =>
                    updateHeader({
                      announcementBar: {
                        ...header.announcementBar!,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary-lime"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={header.announcementBar.backgroundColor}
                      onChange={(e) =>
                        updateHeader({
                          announcementBar: {
                            ...header.announcementBar!,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={header.announcementBar.backgroundColor}
                      onChange={(e) =>
                        updateHeader({
                          announcementBar: {
                            ...header.announcementBar!,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-primary-lime"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={header.announcementBar.textColor}
                      onChange={(e) =>
                        updateHeader({
                          announcementBar: {
                            ...header.announcementBar!,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={header.announcementBar.textColor}
                      onChange={(e) =>
                        updateHeader({
                          announcementBar: {
                            ...header.announcementBar!,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-primary-lime"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderEditor;
