'use client';

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Palette,
  Eye,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function StorefrontPreviewPage() {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const storefrontUrl = `/store/${shopId}`;
  const fullUrl = `${window.location.origin}${storefrontUrl}`;

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success(t('vendor.storefront.urlCopied', { defaultValue: 'URL copied to clipboard!' }));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('vendor.storefront.copyFailed', { defaultValue: 'Failed to copy URL' }));
    }
  };

  const handleOpenInNewTab = () => {
    window.open(storefrontUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary-lime" />
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('vendor.storefront.preview', { defaultValue: 'Storefront Preview' })}
            </h1>
          </div>

          {/* URL Display */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400 max-w-[300px] truncate">
              {fullUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title={t('vendor.storefront.copyUrl', { defaultValue: 'Copy URL' })}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-md transition-colors ${
                device === 'mobile'
                  ? 'bg-primary-lime text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={t('vendor.storefront.mobile', { defaultValue: 'Mobile' })}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-md transition-colors ${
                device === 'tablet'
                  ? 'bg-primary-lime text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={t('vendor.storefront.tablet', { defaultValue: 'Tablet' })}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-md transition-colors ${
                device === 'desktop'
                  ? 'bg-primary-lime text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={t('vendor.storefront.desktop', { defaultValue: 'Desktop' })}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('vendor.storefront.refresh', { defaultValue: 'Refresh' })}</span>
          </Button>

          {/* Edit Storefront Button */}
          <Link to={`/shop/${shopId}/vendor/storefront-builder`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t('vendor.storefront.edit', { defaultValue: 'Edit' })}</span>
            </Button>
          </Link>

          {/* Open in New Tab */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">{t('vendor.storefront.openNewTab', { defaultValue: 'Open' })}</span>
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto p-4">
        <div
          className="mx-auto h-full bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden transition-all duration-300"
          style={{
            width: deviceWidths[device],
            maxWidth: '100%',
          }}
        >
          <iframe
            key={iframeKey}
            src={storefrontUrl}
            className="w-full h-full border-0"
            title="Storefront Preview"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}

export default StorefrontPreviewPage;
