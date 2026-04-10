/**
 * EXAMPLE USAGE FOR PROMO BANNERS
 *
 * This file demonstrates how to use the PromoBanners components
 * in your landing page or homepage.
 */

import {
  PromoBanners,
  HorizontalPromoBanners,
  LargeFeatureBanners,
  CategoryIconsRow,
} from './PromoBanners'

// OPTION 1: Use all banners together (recommended for landing page)
export const LandingPageExample = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section would go here */}

      {/* All promo banners in recommended order */}
      <PromoBanners />

      {/* Popular Products section would go here */}
    </div>
  )
}

// OPTION 2: Use individual banner components
export const CustomLayoutExample = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}

      {/* Just the horizontal 3-card banners */}
      <HorizontalPromoBanners />

      {/* Your popular products section */}
      <div className="py-12">
        {/* Popular products grid */}
      </div>

      {/* Category icons for navigation */}
      <CategoryIconsRow />

      {/* Your content */}

      {/* Large feature banners at the bottom */}
      <LargeFeatureBanners />
    </div>
  )
}

// OPTION 3: Use only specific banners
export const MinimalExample = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Just category icons */}
      <CategoryIconsRow />

      {/* Just horizontal banners */}
      <HorizontalPromoBanners />
    </div>
  )
}

/**
 * CUSTOMIZATION GUIDE
 *
 * 1. Colors:
 *    - Update gradient backgrounds in each card
 *    - Modify from-{color}-{shade} to-{color}-{shade} patterns
 *    - Change button variants (default, secondary, outline)
 *
 * 2. Content:
 *    - Replace text, titles, and descriptions in each card
 *    - Update badge labels (NEW RELEASE, SPECIAL OFFER, etc.)
 *    - Modify discount percentages and offers
 *
 * 3. Icons:
 *    - Import different icons from 'lucide-react'
 *    - Replace icon components in categories array
 *    - Adjust icon sizes (w-6 h-6, w-8 h-8, etc.)
 *
 * 4. Animations:
 *    - Adjust animation delays in transition objects
 *    - Modify staggerChildren timing in containerVariants
 *    - Change hover effects in whileHover props
 *
 * 5. Images (if needed):
 *    - Add background images using bg-[url('/path/to/image.jpg')]
 *    - Use <img> tags with absolute positioning
 *    - Add next/image for optimized loading (Next.js)
 *
 * 6. Responsive Breakpoints:
 *    - Adjust grid-cols-1 md:grid-cols-3 patterns
 *    - Modify text sizes: text-2xl md:text-3xl
 *    - Change padding: p-6 md:p-8
 */

/**
 * INTEGRATION WITH ROUTING
 */
export const RoutableExample = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Pass click handlers to components as needed */}
      <HorizontalPromoBanners />
      <CategoryIconsRow />
      <LargeFeatureBanners />
    </div>
  )
}

export default LandingPageExample
