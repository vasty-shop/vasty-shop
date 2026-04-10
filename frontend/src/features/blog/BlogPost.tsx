import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Eye, Tag, Home, ChevronRight,
  Star, Share2, Clock, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBlogPostBySlug, useRatePost } from './hooks/useBlog';
import { CommentSection, RatingStars, BlogSidebar } from './components';
import { toast } from 'sonner';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: post, isLoading, error } = useBlogPostBySlug(slug || null);
  const ratePostMutation = useRatePost();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleRate = async (rating: number) => {
    if (!user) {
      toast.error('Please login to rate this post');
      return;
    }
    if (!post) return;

    try {
      await ratePostMutation.mutateAsync({ postId: post.id, rating });
      toast.success('Thank you for rating!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to rate post');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-lime rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
          >
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Post not found</h2>
            <p className="text-text-secondary mb-6">The blog post you're looking for doesn't exist.</p>
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

  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    ...(post.category ? [{ label: post.category, href: `/blog?category=${post.category}` }] : []),
    { label: post.title },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <BreadcrumbNavigation items={breadcrumbItems} />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <BlogSidebar showFilters={false} />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Featured Image */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="relative h-64 md:h-96">
                  <img
                    src={post.imageUrls[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.category && (
                    <Link
                      to={`/blog?category=${post.category}`}
                      className="px-3 py-1 text-xs font-semibold bg-primary-lime/10 text-primary-lime rounded-full border border-primary-lime/20 hover:bg-primary-lime/20 transition-colors"
                    >
                      {post.category}
                    </Link>
                  )}
                  {post.featured && (
                    <span className="px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex items-center gap-1">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-lime to-accent-blue flex items-center justify-center text-white font-medium">
                      {post.author?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{post.author || 'Anonymous'}</p>
                      <p className="text-xs text-text-secondary">Author</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{getReadingTime(post.content)} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{post.viewsCount || 0} views</span>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none mb-8
                    prose-headings:text-text-primary prose-headings:font-bold
                    prose-p:text-text-secondary prose-p:leading-relaxed
                    prose-a:text-primary-lime prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-text-primary
                    prose-code:text-primary-lime prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                    prose-blockquote:border-l-primary-lime prose-blockquote:text-text-secondary
                    prose-ul:text-text-secondary prose-ol:text-text-secondary
                    prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-gray-200">
                    <Tag size={16} className="text-gray-400" />
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?search=${tag}`}
                        className="px-3 py-1 text-sm bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Rating Section */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Rate this article</h3>
                  <RatingStars
                    rating={post.rating || 0}
                    totalRatings={post.ratingCount || 0}
                    userRating={post.userRating}
                    onRate={handleRate}
                    readonly={!user || ratePostMutation.isPending}
                    size="lg"
                  />
                  {!user && (
                    <p className="text-sm text-text-secondary mt-2">
                      <Link to="/auth/login" className="text-primary-lime hover:underline">
                        Sign in
                      </Link>{' '}
                      to rate this article
                    </p>
                  )}
                </div>

                {/* Share Section */}
                <div className="flex items-center justify-between mb-8">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.article>

            {/* Comments Section */}
            <div className="mt-8">
              <CommentSection postId={post.id} />
            </div>
          </main>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogPost;
