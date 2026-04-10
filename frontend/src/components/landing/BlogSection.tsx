import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  excerpt?: string;
}

const BlogSection: React.FC = () => {
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: '10 Tips to Grow Your Online Store in 2025',
      category: 'Business',
      image: '/images/blog/couple-denim-sunglasses.jpg',
      date: 'Oct 15, 2025',
      excerpt: 'Discover proven strategies to scale your e-commerce business and increase sales.',
    },
    {
      id: '2',
      title: 'Building Customer Loyalty in E-Commerce',
      category: 'Marketing',
      image: '/images/blog/woman-summer-hat-icecream.jpg',
      date: 'Oct 18, 2025',
      excerpt: 'Learn how successful store owners create lasting relationships with their customers.',
    },
    {
      id: '3',
      title: 'Product Photography That Sells',
      category: 'Tips',
      image: '/images/blog/woman-red-turtleneck.jpg',
      date: 'Oct 20, 2025',
      excerpt: 'Simple techniques to make your products stand out and convert more visitors.',
    },
    {
      id: '4',
      title: 'The Future of Multi-Vendor Marketplaces',
      category: 'Industry',
      image: '/images/blog/couple-blue-teal-shopping.jpg',
      date: 'Oct 22, 2025',
      excerpt: 'How marketplace platforms are reshaping the future of online retail.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Blog Updates
          </h2>
          <a
            href="/blog"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <span className="text-sm md:text-base font-medium">See all</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Blog Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {blogPosts.map((post) => (
            <motion.div key={post.id} variants={cardVariants}>
              <Card
                className={cn(
                  'group overflow-hidden bg-white rounded-xl',
                  'hover:shadow-2xl transition-all duration-300 cursor-pointer',
                  'border border-gray-100'
                )}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-200">
                  {/* Image with zoom effect */}
                  <div className="absolute inset-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 hidden items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">Blog Image</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge
                      className={cn(
                        'bg-gradient-to-r from-orange-500 to-coral-500 text-white',
                        'px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                        'shadow-lg border-0'
                      )}
                      style={{
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                      }}
                    >
                      {post.category}
                    </Badge>
                  </div>

                  {/* Hover Overlay with Read More */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                      'flex items-end justify-center pb-6'
                    )}
                  >
                    <button
                      className={cn(
                        'bg-white text-gray-900 px-6 py-2.5 rounded-full',
                        'font-semibold text-sm flex items-center gap-2',
                        'transform translate-y-4 group-hover:translate-y-0',
                        'transition-all duration-300',
                        'hover:bg-gray-100'
                      )}
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 md:p-6 space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{post.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt (optional, hidden on small cards) */}
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More Link (visible on non-hover) */}
                  <div className="pt-2 group-hover:opacity-0 transition-opacity">
                    <a
                      href={`/blog/${post.id}`}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group/link"
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button (Mobile) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 md:mt-10 flex justify-center sm:hidden"
        >
          <a
            href="/blog"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-3 rounded-full',
              'bg-gray-900 text-white font-semibold',
              'hover:bg-gray-800 transition-colors',
              'group'
            )}
          >
            View All Posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
