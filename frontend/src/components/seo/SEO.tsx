/**
 * SEO Component - Manages dynamic meta tags including canonical URLs
 * Updates document head on mount and cleans up on unmount
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string; // Override path for canonical URL
  noIndex?: boolean; // Set to true for pages that shouldn't be indexed
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
}

const BASE_URL = 'https://vasty.shop';
const DEFAULT_TITLE = 'Vasty - Start and Grow Your Business';
const DEFAULT_DESCRIPTION = 'Vasty - Start, run, and grow your business. Build your online store, sell anywhere, and manage everything from one platform.';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  noIndex = false,
  ogImage,
  ogType = 'website',
}) => {
  const location = useLocation();

  useEffect(() => {
    // Determine canonical URL
    const path = canonicalPath ?? location.pathname;
    // Normalize path: ensure single trailing slash for root, none for other paths
    const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');
    const canonicalUrl = `${BASE_URL}${normalizedPath}`;

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Update title
    const fullTitle = title ? `${title} | Vasty` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Update meta description
    updateMetaTag('description', description || DEFAULT_DESCRIPTION);

    // Update robots meta
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      removeMetaTag('robots');
    }

    // Update Open Graph tags
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description || DEFAULT_DESCRIPTION, 'property');
    updateMetaTag('og:type', ogType, 'property');
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
    }

    // Update Twitter tags
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || DEFAULT_DESCRIPTION);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage);
    }

    // Cleanup on unmount - reset to defaults
    return () => {
      document.title = DEFAULT_TITLE;
      // Reset canonical to base URL
      if (canonicalLink) {
        canonicalLink.href = `${BASE_URL}/`;
      }
    };
  }, [title, description, canonicalPath, noIndex, ogImage, ogType, location.pathname]);

  return null;
};

// Helper to update or create meta tags
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  const selector = attribute === 'property'
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;

  let meta = document.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

// Helper to remove meta tags
function removeMetaTag(name: string, attribute: 'name' | 'property' = 'name') {
  const selector = attribute === 'property'
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;

  const meta = document.querySelector(selector);
  if (meta) {
    meta.remove();
  }
}

export default SEO;
