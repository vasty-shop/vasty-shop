import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Search, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { useBlogPosts } from './hooks/useBlog';
import { BlogCard, BlogSidebar } from './components';
import { BlogType, BlogPost } from './types';

const BlogList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeType, setActiveType] = useState<BlogType>(
    (searchParams.get('type') as BlogType) || 'latest'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const { data, isLoading, error } = useBlogPosts({
    type: activeType,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
    status: 'published',
    page: currentPage,
    limit: 10,
  });

  const posts = data?.data || [];
  const pagination = {
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeType !== 'latest') params.set('type', activeType);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [activeType, selectedCategory, searchQuery, currentPage, setSearchParams]);

  const handleTypeChange = (type: BlogType) => {
    setActiveType(type);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <BreadcrumbNavigation
              items={[{ label: 'Blog', href: '/blog' }]}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-lime/10 via-white to-accent-blue/10 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-lime/20 rounded-full mb-6">
                <BookOpen className="w-8 h-8 text-primary-lime" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                Blog
              </h1>
              <p className="text-lg text-text-secondary mb-8">
                Discover insights, tips, and stories from our community
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base shadow-lg border-gray-200 focus:border-primary-lime bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar */}
              <BlogSidebar
                showFilters={true}
                activeType={activeType}
                selectedCategory={selectedCategory}
                onTypeChange={handleTypeChange}
                onCategoryChange={handleCategoryChange}
              />

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-lime rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200"
                  >
                    <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h3>
                    <p className="text-text-secondary mb-4">Failed to load blog posts</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-primary-lime hover:bg-primary-lime/90 text-white"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && !error && posts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200"
                  >
                    <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">No posts found</h3>
                    <p className="text-text-secondary">
                      {searchQuery
                        ? `No posts matching "${searchQuery}"`
                        : 'There are no blog posts yet'}
                    </p>
                  </motion.div>
                )}

                {/* Posts Grid */}
                {!isLoading && !error && posts.length > 0 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      {posts.map((post: BlogPost, index: number) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <BlogCard post={post} />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                        >
                          <ChevronLeft size={16} />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={
                                  pageNum === currentPage
                                    ? 'bg-primary-lime hover:bg-primary-lime/90 text-white border-0'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime'
                                }
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* Results info */}
                    <div className="mt-4 text-center text-sm text-text-secondary">
                      Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, pagination.total)} of {pagination.total} posts
                    </div>
                  </>
                )}
              </main>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BlogList;
