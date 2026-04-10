import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Eye, Calendar, MoreVertical, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBlogPosts, useDeleteBlogPost } from './hooks/useBlog';
import { BlogSidebar } from './components';
import { BlogPost } from './types';
import { toast } from 'sonner';

const MyBlogs: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useMyBlogPosts({
    status: 'published',
    page: currentPage,
    limit: 10,
  });

  const deletePostMutation = useDeleteBlogPost();

  const posts = data?.data || [];
  const pagination = {
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
  };

  // Allow all authenticated users to access their blog posts
  const isBlogger = !!user;

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Post deleted successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
    setOpenMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
          >
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in</h2>
            <p className="text-text-secondary mb-6">You need to be logged in to view your posts.</p>
            <Button
              onClick={() => navigate('/auth/login')}
              className="bg-primary-lime hover:bg-primary-lime/90 text-white"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isBlogger) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
          >
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h2>
            <p className="text-text-secondary mb-6">You need the blogger role to view your posts.</p>
            <Button
              onClick={() => navigate('/blog')}
              className="bg-primary-lime hover:bg-primary-lime/90 text-white"
            >
              Back to Blog
            </Button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <BreadcrumbNavigation
              items={[
                { label: 'Blog', href: '/blog' },
                { label: 'My Posts' },
              ]}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">My Posts</h1>
              <p className="text-text-secondary">Manage your blog posts</p>
            </div>
            <Link to="/blog/create">
              <Button className="bg-primary-lime hover:bg-primary-lime/90 text-white">
                <Plus size={16} className="mr-2" />
                New Post
              </Button>
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <BlogSidebar showFilters={false} />

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
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h3>
                  <p className="text-text-secondary mb-4">Failed to load your posts</p>
                  <Button
                    onClick={() => refetch()}
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
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h3>
                  <p className="text-text-secondary mb-6">Start sharing your thoughts with the world</p>
                  <Link to="/blog/create">
                    <Button className="bg-primary-lime hover:bg-primary-lime/90 text-white">
                      <Plus size={16} className="mr-2" />
                      Create Your First Post
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Posts List */}
              {!isLoading && !error && posts.length > 0 && (
                <div className="space-y-4">
                  {posts.map((post: BlogPost, index: number) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-primary-lime/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          {post.imageUrls && post.imageUrls.length > 0 ? (
                            <img
                              src={post.imageUrls[0]}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                to={`/blog/${post.slug}`}
                                className="text-lg font-semibold text-text-primary hover:text-primary-lime transition-colors line-clamp-1"
                              >
                                {post.title}
                              </Link>
                              <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                                {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                              </p>
                            </div>

                            {/* Actions Menu */}
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                                className="text-gray-500 hover:text-text-primary"
                              >
                                <MoreVertical size={18} />
                              </Button>

                              {openMenu === post.id && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                                  <Link
                                    to={`/blog/${post.slug}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye size={14} />
                                    View
                                  </Link>
                                  <Link
                                    to={`/blog/edit/${post.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(post.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={12} />
                              <span>{post.viewsCount || 0} views</span>
                            </div>
                            {post.category && (
                              <span className="px-2 py-0.5 bg-primary-lime/10 text-primary-lime rounded-full">
                                {post.category}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-600'
                                : post.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-text-secondary px-4">
                        Page {currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyBlogs;
