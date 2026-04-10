import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug?: string;
  image: string;
  backgroundColor: string;
  filter: 'ALL' | 'WOMAN' | 'CHILDREN';
  description?: string;
  productCount?: number;
}

interface FilterTab {
  id: string;
  label: string;
  value: 'ALL' | 'WOMAN' | 'CHILDREN';
}

const filterTabs: FilterTab[] = [
  { id: 'all', label: 'ALL', value: 'ALL' },
  { id: 'woman', label: 'WOMAN', value: 'WOMAN' },
  { id: 'children', label: 'CHILDREN', value: 'CHILDREN' },
];

// Color palette for categories
const categoryColors = [
  '#f3f4f6',
  '#fef3c7',
  '#e5e7eb',
  '#fef9f3',
  '#e0f2fe',
  '#fce7f3',
  '#f0fdf4',
  '#fef2f2',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const CategoryBrowseSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WOMAN' | 'CHILDREN'>('ALL');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getCategories();

        // Map API data to component format
        const mappedCategories: Category[] = data.map((cat: any, index: number) => ({
          id: cat.id || cat._id,
          name: cat.name?.toUpperCase() || 'CATEGORY',
          slug: cat.slug,
          image: cat.image || cat.imageUrl || `/images/categories/placeholder-${index + 1}.jpg`,
          backgroundColor: categoryColors[index % categoryColors.length],
          filter: 'ALL' as const, // Default to ALL, can be enhanced with metadata
          description: cat.description,
          productCount: cat.productCount || 0,
        }));

        setCategories(mappedCategories);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');

        // Show fallback categories on error
        setCategories([
          {
            id: 'fallback-1',
            name: 'FASHION',
            image: '/images/categories/fashion.jpg',
            backgroundColor: '#f3f4f6',
            filter: 'ALL',
          },
          {
            id: 'fallback-2',
            name: 'ELECTRONICS',
            image: '/images/categories/electronics.jpg',
            backgroundColor: '#fef3c7',
            filter: 'ALL',
          },
          {
            id: 'fallback-3',
            name: 'HOME',
            image: '/images/categories/home.jpg',
            backgroundColor: '#e5e7eb',
            filter: 'ALL',
          },
          {
            id: 'fallback-4',
            name: 'BEAUTY',
            image: '/images/categories/beauty.jpg',
            backgroundColor: '#fef9f3',
            filter: 'ALL',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    if (activeFilter === 'ALL') return true;
    return category.filter === activeFilter;
  });

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12"
        >
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            Browse by categories
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveFilter(tab.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-4 md:px-5 py-2 md:py-2.5 rounded-pill text-xs md:text-sm font-semibold transition-all duration-300',
                  activeFilter === tab.value
                    ? 'bg-text-primary text-white shadow-md'
                    : 'bg-white text-text-secondary border border-gray-200 hover:border-text-primary'
                )}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl bg-gray-200 aspect-[3/4]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-lime text-white rounded-button hover:bg-primary-lime-dark transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Category Cards Grid */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group cursor-pointer"
            >
              <div
                className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: category.backgroundColor }}
              >
                {/* Aspect Ratio Container */}
                <div className="relative aspect-[3/4]">
                  {/* Product Image */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="w-full h-full relative">
                      {/* Placeholder gradient for missing images */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-20"
                        style={{
                          background: `linear-gradient(135deg, ${category.backgroundColor} 0%, rgba(0,0,0,0.05) 100%)`
                        }}
                      />

                      {/* Image container with scale effect on hover */}
                      <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-contain drop-shadow-xl"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.currentTarget;
                            target.style.display = 'none';
                          }}
                        />

                        {/* Fallback placeholder icon when image is not available */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <div className="text-6xl font-bold text-gray-400">
                            {category.name.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Label Badge */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge
                      className={cn(
                        'bg-white/95 backdrop-blur-sm text-text-primary',
                        'px-4 py-2 text-xs md:text-sm font-bold tracking-wide',
                        'shadow-lg border-0',
                        'group-hover:bg-text-primary group-hover:text-white',
                        'transition-all duration-300'
                      )}
                    >
                      {category.name}
                    </Badge>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-text-secondary">
              No categories found for this filter.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoryBrowseSection;
