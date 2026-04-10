"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Watch,
  Sparkles,
  Droplets,
  Clock,
  ShoppingBag,
  Shirt,
  Package2,
  Footprints,
  Glasses,
  Grid3x3,
} from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const hoverScale = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  transition: { duration: 0.3 },
}

// Horizontal 3-Card Row Component
export const HorizontalPromoBanners = () => {
  return (
    <motion.div
      className="w-full px-4 md:px-6 py-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
        {/* Card 1: New Release Watch */}
        <motion.div
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 via-peach-100 to-pink-100 p-6 md:p-8 shadow-card group cursor-pointer"
          variants={itemVariants}
          whileHover={hoverScale}
        >
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[280px]">
            <div>
              <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-lime mb-3">
                NEW RELEASE
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
                Premium
                <br />
                Watch
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Timeless elegance meets modern design
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                className="bg-card-black text-white hover:bg-primary-lime hover:text-white transition-all"
              >
                Buy Now
              </Button>
              <Watch className="w-20 h-20 text-text-secondary/20 group-hover:text-primary-lime/30 transition-colors" />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-transparent to-pink-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Card 2: 30% Sale Jewelry */}
        <motion.div
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 p-6 md:p-8 shadow-card group cursor-pointer"
          variants={itemVariants}
          whileHover={hoverScale}
        >
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[280px]">
            <div>
              <span className="inline-block px-3 py-1 bg-badge-sale text-white rounded-full text-xs font-semibold mb-3">
                30% OFF
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
                Luxury
                <br />
                Jewelry
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Shine bright with exclusive collections
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-primary-lime">30%</span>
                <span className="text-sm text-text-secondary ml-2">Sale</span>
              </div>
              <Sparkles className="w-20 h-20 text-text-secondary/20 group-hover:text-accent-blue/30 transition-colors" />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-transparent to-cyan-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Card 3: Buy 2 Get 1 Perfume */}
        <motion.div
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 p-6 md:p-8 shadow-card group cursor-pointer"
          variants={itemVariants}
          whileHover={hoverScale}
        >
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[280px]">
            <div>
              <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-fuchsia-600 mb-3">
                SPECIAL OFFER
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
                Premium
                <br />
                Perfume
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Buy 2 Get 1 Free - Limited time
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="default"
                size="sm"
                className="bg-primary-lime text-white hover:bg-primary-lime-dark"
              >
                Shop Now
              </Button>
              <Droplets className="w-20 h-20 text-text-secondary/20 group-hover:text-fuchsia-400/30 transition-colors" />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-transparent to-fuchsia-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      </div>
    </motion.div>
  )
}

// Large Feature Banners Component
export const LargeFeatureBanners = () => {
  return (
    <motion.div
      className="w-full px-4 md:px-6 py-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto">
        {/* Left: Coming Soon - Winter Products */}
        <motion.div
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8 md:p-12 shadow-card group cursor-pointer min-h-[400px] lg:min-h-[500px]"
          variants={itemVariants}
          whileHover={hoverScale}
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <span className="inline-block px-4 py-2 bg-primary-lime text-white rounded-full text-xs font-bold mb-4">
                COMING SOON
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Winter
                <br />
                Collection
              </h2>
              <p className="text-gray-300 text-base mb-8 max-w-md">
                Get ready for the season's hottest winter fashion.
                <br />
                Pre-order now and save up to 40%
              </p>
            </div>

            <div>
              <Button
                variant="default"
                size="lg"
                className="bg-primary-lime text-white hover:bg-white hover:text-card-black transition-all"
              >
                Pre-Sale Now
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-8 right-8 w-64 h-64 bg-primary-lime/10 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-8">
            <Clock className="w-32 h-32 text-white/10 group-hover:text-white/20 transition-colors" />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-lime/20 via-transparent to-accent-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        {/* Right: Split into Top/Bottom */}
        <div className="grid grid-rows-2 gap-4 md:gap-6">
          {/* Top: Model in Red Sweater */}
          <motion.div
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-200 via-peach-200 to-pink-200 p-6 md:p-8 shadow-card group cursor-pointer min-h-[200px]"
            variants={itemVariants}
            whileHover={hoverScale}
          >
            <div className="relative z-10 flex items-center justify-between h-full">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
                  Fashion
                  <br />
                  Forward
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  New season styles are here
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-card-black text-white hover:bg-primary-lime hover:text-white"
                >
                  Explore
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Shirt className="w-12 h-12 md:w-16 md:h-16 text-card-black" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-primary-lime rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 via-transparent to-pink-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Bottom: 50% Discount */}
          <motion.div
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-200 p-6 md:p-8 shadow-card group cursor-pointer min-h-[200px]"
            variants={itemVariants}
            whileHover={hoverScale}
          >
            <div className="relative z-10 flex items-center justify-between h-full">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-badge-sale text-white rounded-full text-xs font-bold mb-3">
                  MEGA SALE
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-card-black mb-2">
                  50% OFF
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Biggest discount of the year
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary-lime text-white hover:bg-primary-lime-dark"
                >
                  Shop Now
                </Button>
              </div>

              <div className="hidden md:block">
                <ShoppingBag className="w-24 h-24 text-text-secondary/20 group-hover:text-accent-blue/40 transition-colors" />
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 via-transparent to-cyan-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Category Icons Row Component
interface CategoryItem {
  id: string
  label: string
  icon: React.ReactNode
  color: string
}

// Color palette for categories - cycles through these colors
const categoryColorPalette = [
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-pink-400 to-pink-500',
  'from-indigo-400 to-indigo-500',
  'from-orange-400 to-orange-500',
  'from-teal-400 to-teal-500',
  'from-amber-400 to-amber-500',
  'from-rose-400 to-rose-500',
  'from-emerald-400 to-emerald-500',
  'from-cyan-400 to-cyan-500',
]

// Default icon for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('shirt') || name.includes('t-shirt')) return <Shirt className="w-6 h-6" />
  if (name.includes('jacket') || name.includes('coat')) return <Package2 className="w-6 h-6" />
  if (name.includes('bag') || name.includes('backpack')) return <ShoppingBag className="w-6 h-6" />
  if (name.includes('shoe') || name.includes('footwear')) return <Footprints className="w-6 h-6" />
  if (name.includes('watch') || name.includes('clock')) return <Watch className="w-6 h-6" />
  if (name.includes('glass') || name.includes('cap') || name.includes('hat')) return <Glasses className="w-6 h-6" />
  if (name.includes('perfume') || name.includes('fragrance')) return <Droplets className="w-6 h-6" />
  return <Package2 className="w-6 h-6" /> // default icon
}

export const CategoryIconsRow = () => {
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const { default: api } = await import('@/lib/api')
        const categoriesData = await api.getCategories()

        // Transform API data to category items
        const transformedCategories: CategoryItem[] = (Array.isArray(categoriesData) ? categoriesData : [])
          .slice(0, 8) // Show top 8 categories
          .map((cat: any, index: number) => ({
            id: cat.id || cat._id || `cat-${index}`,
            label: cat.name,
            icon: getCategoryIcon(cat.name),
            color: categoryColorPalette[index % categoryColorPalette.length],
          }))

        // Add "All Category" at the end
        transformedCategories.push({
          id: 'all',
          label: 'All Category',
          icon: <Grid3x3 className="w-6 h-6" />,
          color: 'from-primary-lime to-lime-600',
        })

        setCategories(transformedCategories)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Fallback to empty or default categories
        setCategories([
          {
            id: 'all',
            label: 'All Category',
            icon: <Grid3x3 className="w-6 h-6" />,
            color: 'from-primary-lime to-lime-600',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <motion.div
      className="w-full px-4 md:px-6 py-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-card-black">
            Shop by Category
          </h2>
          <Button variant="ghost" size="sm" className="text-primary-lime">
            See All
          </Button>
        </div>

        {/* Scrollable Category Container */}
        <div className="relative">
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 snap-start">
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-16 h-16 md:w-18 md:h-18 bg-gray-200 rounded-2xl animate-pulse" />
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              categories.map((category, index) => (
              <motion.button
                key={category.id}
                className="flex-shrink-0 snap-start group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                  <motion.div
                    className={`w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                    whileHover={{
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.3 },
                    }}
                  >
                    {category.icon}
                  </motion.div>
                  <span className="text-xs md:text-sm font-medium text-card-black text-center group-hover:text-primary-lime transition-colors">
                    {category.label}
                  </span>
                </div>
              </motion.button>
              ))
            )}
          </div>

          {/* Gradient Fade on Scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  )
}

// Main PromoBanners Component (exports all variants)
export const PromoBanners = () => {
  return (
    <div className="w-full space-y-4 md:space-y-6">
      <HorizontalPromoBanners />
      <CategoryIconsRow />
      <LargeFeatureBanners />
    </div>
  )
}

// Named exports for individual usage
export default PromoBanners
