/**
 * TypeScript Type Definitions for PromoBanners Components
 *
 * Use these types when extending or customizing the banner components
 */

import { ReactNode } from 'react'
import { Variants } from 'framer-motion'

// ============================================================================
// Base Types
// ============================================================================

export interface BannerCardProps {
  /** Unique identifier for the banner */
  id?: string

  /** Title text displayed prominently */
  title: string

  /** Subtitle or description text */
  description?: string

  /** Badge label (e.g., "NEW", "SALE", "LIMITED") */
  badge?: {
    text: string
    variant?: 'default' | 'sale' | 'success' | 'warning'
  }

  /** CTA button configuration */
  cta?: {
    text: string
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
    onClick?: () => void
    href?: string
  }

  /** Background gradient colors */
  gradient?: {
    from: string
    via?: string
    to: string
  }

  /** Icon to display (React component) */
  icon?: ReactNode

  /** Background image URL */
  backgroundImage?: string

  /** Custom CSS classes */
  className?: string

  /** Click handler for entire card */
  onClick?: () => void

  /** Analytics tracking data */
  analytics?: {
    category: string
    action: string
    label: string
  }
}

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryItem {
  /** Unique category identifier */
  id: string

  /** Display label for the category */
  label: string

  /** Icon component to display */
  icon: ReactNode

  /** Gradient color classes (e.g., "from-blue-400 to-blue-500") */
  color: string

  /** Optional click handler */
  onClick?: () => void

  /** Optional badge count (e.g., number of items) */
  badge?: number

  /** Whether category is currently active */
  isActive?: boolean
}

export interface CategoryIconsRowProps {
  /** Array of category items to display */
  categories?: CategoryItem[]

  /** Handler for category selection */
  onCategorySelect?: (categoryId: string) => void

  /** Whether to show "See All" button */
  showSeeAll?: boolean

  /** Handler for "See All" click */
  onSeeAllClick?: () => void

  /** Custom title for the section */
  title?: string

  /** Custom CSS classes */
  className?: string
}

// ============================================================================
// Horizontal Banners Types
// ============================================================================

export interface HorizontalBannerCard {
  /** Unique identifier */
  id: string

  /** Card type for styling */
  type: 'watch' | 'jewelry' | 'perfume' | 'custom'

  /** Badge configuration */
  badge: {
    text: string
    variant: 'new' | 'sale' | 'special'
  }

  /** Title text */
  title: string

  /** Description text */
  description: string

  /** Button configuration */
  button: {
    text: string
    variant: 'default' | 'secondary'
    onClick?: () => void
  }

  /** Gradient background */
  gradient: {
    from: string
    via: string
    to: string
  }

  /** Icon component */
  icon: ReactNode

  /** Icon color on hover */
  iconHoverColor?: string
}

export interface HorizontalPromoBannersProps {
  /** Custom banner cards (overrides defaults) */
  cards?: HorizontalBannerCard[]

  /** Custom CSS classes */
  className?: string

  /** Animation configuration */
  animation?: {
    enabled?: boolean
    staggerDelay?: number
    duration?: number
  }
}

// ============================================================================
// Large Feature Banners Types
// ============================================================================

export interface FeatureBannerConfig {
  /** Left panel configuration */
  leftPanel?: {
    badge: string
    title: string
    description: string
    buttonText: string
    buttonVariant?: 'default' | 'secondary'
    gradient: string
    onClick?: () => void
  }

  /** Right panel top section */
  rightTopPanel?: {
    title: string
    description: string
    buttonText: string
    buttonVariant?: 'default' | 'secondary'
    gradient: string
    icon?: ReactNode
    onClick?: () => void
  }

  /** Right panel bottom section */
  rightBottomPanel?: {
    badge: string
    title: string
    description: string
    buttonText: string
    buttonVariant?: 'default' | 'secondary'
    gradient: string
    icon?: ReactNode
    onClick?: () => void
  }
}

export interface LargeFeatureBannersProps {
  /** Custom configuration (overrides defaults) */
  config?: FeatureBannerConfig

  /** Custom CSS classes */
  className?: string

  /** Animation configuration */
  animation?: {
    enabled?: boolean
    duration?: number
  }
}

// ============================================================================
// Main PromoBanners Types
// ============================================================================

export interface PromoBannersProps {
  /** Whether to show horizontal banners */
  showHorizontal?: boolean

  /** Whether to show category icons */
  showCategories?: boolean

  /** Whether to show large feature banners */
  showFeature?: boolean

  /** Custom horizontal banners props */
  horizontalProps?: HorizontalPromoBannersProps

  /** Custom category icons props */
  categoryProps?: CategoryIconsRowProps

  /** Custom feature banners props */
  featureProps?: LargeFeatureBannersProps

  /** Custom layout order */
  layout?: Array<'horizontal' | 'categories' | 'feature'>

  /** Custom CSS classes */
  className?: string
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationConfig {
  /** Framer Motion container variants */
  containerVariants?: Variants

  /** Framer Motion item variants */
  itemVariants?: Variants

  /** Hover animation config */
  hoverScale?: {
    scale: number
    boxShadow: string
    transition: {
      duration: number
    }
  }

  /** Whether to enable viewport animations */
  enableViewport?: boolean

  /** Viewport animation margin */
  viewportMargin?: string

  /** Whether to run animation only once */
  once?: boolean
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type BannerClickHandler = (
  bannerId: string,
  bannerType: 'horizontal' | 'category' | 'feature',
  analytics?: {
    category: string
    action: string
    label: string
  }
) => void

export type CategorySelectHandler = (
  categoryId: string,
  categoryLabel: string
) => void

export type CTAClickHandler = (
  ctaId: string,
  ctaType: 'buy-now' | 'shop-now' | 'pre-sale' | 'explore'
) => void

// ============================================================================
// Utility Types
// ============================================================================

export type GradientDirection =
  | 'to-r'
  | 'to-l'
  | 'to-t'
  | 'to-b'
  | 'to-tr'
  | 'to-tl'
  | 'to-br'
  | 'to-bl'

export type ColorStop = {
  color: string
  position?: string
}

export interface CustomGradient {
  direction: GradientDirection
  stops: ColorStop[]
}

export type BadgeVariant = 'default' | 'sale' | 'new' | 'special' | 'limited'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link'

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

// ============================================================================
// Responsive Types
// ============================================================================

export interface ResponsiveConfig {
  mobile: {
    columns: number
    gap: string
    padding: string
  }
  tablet: {
    columns: number
    gap: string
    padding: string
  }
  desktop: {
    columns: number
    gap: string
    padding: string
  }
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface BannerAnalytics {
  /** Event category (e.g., "Promo Banner") */
  category: string

  /** Event action (e.g., "Click", "View", "Hover") */
  action: 'click' | 'view' | 'hover' | 'scroll'

  /** Event label (e.g., "Winter Sale Banner") */
  label: string

  /** Custom event value */
  value?: number

  /** Additional metadata */
  metadata?: Record<string, any>
}

// ============================================================================
// Theme Types
// ============================================================================

export interface BannerTheme {
  /** Primary brand color */
  primaryColor: string

  /** Secondary brand color */
  secondaryColor: string

  /** Accent color */
  accentColor: string

  /** Text colors */
  textPrimary: string
  textSecondary: string

  /** Background colors */
  backgroundLight: string
  backgroundDark: string

  /** Border radius */
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }

  /** Shadows */
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// ============================================================================
// Export All Types
// ============================================================================

export type { Variants as FramerVariants } from 'framer-motion'
