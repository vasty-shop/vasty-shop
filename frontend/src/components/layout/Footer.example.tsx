/**
 * Footer Component - Example & Documentation
 *
 * A comprehensive, production-ready footer component for the Vasty e-commerce platform.
 * Inspired by world-class e-commerce sites like Amazon, Nike, ASOS, and Shopify stores.
 *
 * FEATURES:
 * =========
 *
 * 1. Four-Column Desktop Layout:
 *    - Column 1: Company branding, contact info, and social media links
 *    - Column 2: Quick Links (About, Contact, Careers, Press, Store Locator)
 *    - Column 3: Customer Service (FAQ, Shipping, Tracking, Size Guide, Privacy, Terms)
 *    - Column 4: Newsletter signup with validation and payment method icons
 *
 * 2. Responsive Design:
 *    - Desktop: 4 columns with optimal spacing
 *    - Tablet: 2 columns stacked
 *    - Mobile: Single column with touch-optimized spacing
 *
 * 3. Newsletter Subscription:
 *    - Email validation with error messages
 *    - Loading state with spinner animation
 *    - Success confirmation with check icon
 *    - Privacy policy notice
 *    - Accessible ARIA labels
 *
 * 4. Social Media Integration:
 *    - Facebook, Twitter, Instagram, YouTube, LinkedIn
 *    - Hover effects with scale animation
 *    - Lime green brand color on hover
 *    - External links with noopener noreferrer
 *
 * 5. Contact Information:
 *    - Email with mailto link
 *    - Phone with tel link
 *    - Physical address display
 *    - Icon-based visual design
 *
 * 6. Payment Methods:
 *    - Visual display of accepted payment types
 *    - Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay
 *    - Hover effects on cards
 *
 * 7. Bottom Bar:
 *    - Dynamic copyright year
 *    - Legal links (Privacy | Terms | Cookies)
 *    - Language/Currency selectors
 *    - Responsive ordering
 *
 * 8. Trust Badges Strip:
 *    - Secure Shopping indicator
 *    - Free Shipping info
 *    - 30-Day Returns policy
 *    - 24/7 Support availability
 *    - SVG icons with lime green accent
 *
 * 9. Design Highlights:
 *    - Dark gradient background (slate-900 to slate-950)
 *    - Lime green accent color (#84cc16) for brand consistency
 *    - Smooth hover transitions and animations
 *    - Professional typography and spacing
 *    - Bullet points with animated colors
 *    - Section headers with underline accent
 *
 * 10. Accessibility:
 *     - Proper ARIA labels for all interactive elements
 *     - Semantic HTML with role="contentinfo"
 *     - Keyboard navigation support
 *     - Screen reader friendly
 *     - Error messages with aria-invalid and aria-describedby
 *
 * USAGE:
 * ======
 *
 * import Footer from '@/components/layout/Footer';
 *
 * function App() {
 *   return (
 *     <div>
 *       {/* Your page content *\/}
 *       <Footer />
 *     </div>
 *   );
 * }
 *
 * CUSTOMIZATION:
 * ==============
 *
 * To customize the footer, modify the following arrays in the component:
 *
 * - companyLinks: Quick links column
 * - customerServiceLinks: Customer service column
 * - socialLinks: Social media platforms
 * - paymentMethods: Accepted payment types
 * - legalLinks: Bottom bar legal links
 *
 * INTEGRATION NOTES:
 * ==================
 *
 * The newsletter subscription currently uses a simulated API call (setTimeout).
 * To integrate with your backend:
 *
 * 1. Replace the setTimeout in handleNewsletterSubmit with an actual API call
 * 2. Handle success/error responses appropriately
 * 3. Consider adding analytics tracking for subscription events
 *
 * Example:
 *
 * const handleNewsletterSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   setSubscriptionStatus('loading');
 *
 *   try {
 *     await api.post('/newsletter/subscribe', { email });
 *     setSubscriptionStatus('success');
 *     setEmail('');
 *   } catch (error) {
 *     setSubscriptionStatus('error');
 *     setEmailError('Subscription failed. Please try again.');
 *   }
 * };
 *
 * BRAND COLORS:
 * =============
 *
 * - Primary Lime: #84cc16 (Vasty brand color)
 * - Dark Background: slate-900 to slate-950 gradient
 * - Text Primary: white
 * - Text Secondary: gray-300/gray-400
 * - Accent Backgrounds: slate-800
 *
 * DEPENDENCIES:
 * =============
 *
 * - React 19+
 * - React Router DOM (for Link component)
 * - Lucide React (for icons)
 * - Tailwind CSS 3+
 * - @/lib/utils (cn utility for class merging)
 */

import React from 'react';
import Footer from './Footer';

/**
 * Example page demonstrating the Footer component
 * This shows how the footer looks in a complete page context
 */
export const FooterExample: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Example page content */}
      <div className="flex-1 bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Footer Component Example
            </h1>
            <p className="text-xl text-gray-600">
              Scroll down to see the comprehensive footer component in action
            </p>
            <div className="bg-white rounded-lg shadow-md p-8 text-left space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Key Features:</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>4-column responsive layout with mobile optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Newsletter subscription with email validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Social media integration with 5 platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Contact information with clickable email/phone links</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Payment method indicators (6 types)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Trust badges for security, shipping, returns, and support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Smooth hover effects and animations throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>ARIA labels and accessibility features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Language and currency selector placeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-500 font-bold">✓</span>
                  <span>Professional dark theme with Vasty brand colors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* The actual Footer component */}
      <Footer />
    </div>
  );
};

export default FooterExample;
