/**
 * Vasty Chatbot Integration for Vasty Shop
 *
 * Lightweight chatbot widget that loads via a simple script tag approach
 * Similar to Deskive - no SDK required
 *
 * Usage:
 * <script defer data-api-key="anon_xxx" src="https://api.vasty.com/js/chatbot.js"></script>
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Get configuration from environment
const VASTY_API_KEY = import.meta.env.VITE_VITE_ANON_KEY || '';
const VASTY_API_URL = import.meta.env.VITE_VITE_API_URL || 'https://api.vasty.com';

// Check if chatbot is enabled
const isChatbotEnabled = (): boolean => {
  return Boolean(VASTY_API_KEY && VASTY_API_KEY.startsWith('anon_'));
};

// Public pages where chatbot should be shown
const PUBLIC_PATHS = [
  '/',
  '/shop',
  '/explore',
  '/outfits',
  '/products',
  '/product',
  '/category',
  '/categories',
  '/contact',
  '/about',
  '/faq',
  '/terms',
  '/privacy',
  '/cookies',
  '/shipping',
  '/press',
  '/stores',
  '/size-guide',
  '/offers',
  '/campaign',
  '/cart',
  '/wishlist',
  '/track-order',
  '/store',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/page',
];

// Check if current path is a public page
const isPublicPage = (pathname: string): boolean => {
  // Exact matches or starts with public paths
  return PUBLIC_PATHS.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );
};

interface VastyChatbotProps {
  debug?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  greeting?: string;
  placeholder?: string;
}

/**
 * Vasty Chatbot Component
 *
 * Drop-in component that loads Vasty Chatbot script
 * Place in App.tsx to enable the chat widget
 *
 * @example
 * ```tsx
 * // In App.tsx
 * import { VastyChatbot } from './components/chat/VastyChatbot';
 *
 * function App() {
 *   return (
 *     <>
 *       <VastyChatbot
 *         debug={process.env.NODE_ENV === 'development'}
 *         position="bottom-right"
 *         primaryColor="#8B5CF6"
 *         greeting="Hi! How can I help you today?"
 *       />
 *       <Routes>...</Routes>
 *     </>
 *   );
 * }
 * ```
 */
export const VastyChatbot: React.FC<VastyChatbotProps> = ({
  debug = false,
  position = 'bottom-right',
  primaryColor = '#8B5CF6',
  greeting = 'Hi! How can I help you with your shopping today?',
  placeholder = 'Type your message...',
}) => {
  const location = useLocation();

  useEffect(() => {
    // Skip if API key is not configured
    if (!isChatbotEnabled()) {
      return;
    }

    const shouldShow = isPublicPage(location.pathname);

    // Hide chatbot on internal pages (vendor dashboard, admin, delivery, etc.)
    if (!shouldShow) {
      // Hide the chatbot widget if it exists
      const chatbotWidget = document.getElementById('vasty-chatbot-widget');
      if (chatbotWidget) {
        chatbotWidget.style.display = 'none';
      }
      // Also try to close it if open
      if (window.vastyChatbot) {
        window.vastyChatbot.close();
      }
      return;
    }

    // Show chatbot on public pages
    const chatbotWidget = document.getElementById('vasty-chatbot-widget');
    if (chatbotWidget) {
      chatbotWidget.style.display = 'block';
    }

    // Check if script is already loaded (persists across StrictMode remounts)
    const existingScript = document.getElementById('vasty-chatbot-script');
    if (existingScript) {
      return;
    }

    // Create and inject the script tag
    const script = document.createElement('script');
    script.id = 'vasty-chatbot-script';
    script.defer = true;
    script.src = `${VASTY_API_URL}/js/chatbot.js`;
    script.setAttribute('data-api-key', VASTY_API_KEY);
    script.setAttribute('data-api-url', VASTY_API_URL);
    script.setAttribute('data-position', position);
    script.setAttribute('data-primary-color', primaryColor);
    script.setAttribute('data-greeting', greeting);
    script.setAttribute('data-placeholder', placeholder);
    if (debug) {
      script.setAttribute('data-debug', 'true');
    }

    script.onload = () => {
      // Script loaded
    };

    script.onerror = (e) => {
      console.error('[Vasty Chatbot] Failed to load script', e);
    };

    document.head.appendChild(script);

    // No cleanup - let the script persist for the app lifetime
    // This prevents issues with React StrictMode double-mounting
  }, [debug, position, primaryColor, greeting, placeholder, location.pathname]);

  // This component doesn't render anything - the script handles the DOM
  return null;
};

// Global vasty chatbot interface (set by chatbot.js script)
declare global {
  interface Window {
    vastyChatbot?: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      sendMessage: (message: string) => void;
      setUser: (user: { id?: string; name?: string; email?: string }) => void;
      destroy: () => void;
    };
  }
}

/**
 * Open the chatbot widget
 */
export const openVastyChatbot = (): void => {
  if (window.vastyChatbot) {
    window.vastyChatbot.open();
  }
};

/**
 * Close the chatbot widget
 */
export const closeVastyChatbot = (): void => {
  if (window.vastyChatbot) {
    window.vastyChatbot.close();
  }
};

/**
 * Toggle the chatbot widget
 */
export const toggleVastyChatbot = (): void => {
  if (window.vastyChatbot) {
    window.vastyChatbot.toggle();
  }
};

/**
 * Send a message programmatically
 */
export const sendVastyMessage = (message: string): void => {
  if (window.vastyChatbot) {
    window.vastyChatbot.sendMessage(message);
  }
};

/**
 * Set user info for the chatbot
 */
export const setVastyChatUser = (user: { id?: string; name?: string; email?: string }): void => {
  if (window.vastyChatbot) {
    window.vastyChatbot.setUser(user);
  }
};

/**
 * Hook to access Vasty Chatbot
 * Returns the global vastyChatbot object if available
 */
export const useVastyChatbot = () => {
  return window.vastyChatbot || null;
};

export default VastyChatbot;
