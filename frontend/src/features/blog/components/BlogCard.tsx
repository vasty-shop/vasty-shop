import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, Eye, Calendar } from 'lucide-react';
import { BlogPost } from '../types';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, className }) => {
  const getImageUrl = () => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      return post.imageUrls[0];
    }
    return '/placeholder-blog.svg';
  };

  const imageUrl = getImageUrl();

  const getPreviewContent = (html: string, maxLength: number = 120) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    if (plainText.length <= maxLength) {
      return plainText.trim();
    }
    return plainText.slice(0, maxLength).trim() + '...';
  };

  const previewContent = post.excerpt || getPreviewContent(post.content);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link to={`/blog/${post.slug}`} className={cn('block group h-full', className)}>
      <article className="h-full bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-lime/50 hover:shadow-lg hover:-translate-y-1 flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {post.category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-primary-lime rounded-full border border-primary-lime/20 backdrop-blur-sm">
                {post.category}
              </span>
            </div>
          )}

          {post.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-semibold bg-amber-50/90 text-amber-600 rounded-full border border-amber-200 backdrop-blur-sm flex items-center gap-1">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-lime transition-colors">
            {post.title}
          </h3>

          <p className="text-text-secondary text-sm line-clamp-2 mb-4 flex-1">
            {previewContent}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.viewsCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{post.commentsCount || 0}</span>
            </div>
            {post.rating && post.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{post.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author || 'Author'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-lime to-accent-blue flex items-center justify-center text-white text-xs font-medium">
                  {post.author?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <span className="text-sm text-text-primary font-medium">
                {post.author || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar size={12} />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
