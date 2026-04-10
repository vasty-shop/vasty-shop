import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp, Clock, Award, Filter, Plus, Tag,
  FolderOpen, ChevronRight, Flame, FileText, PenLine, List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogCategories } from '../hooks/useBlog';
import { useAuth } from '@/contexts/AuthContext';
import { BlogType } from '../types';

interface BlogSidebarProps {
  activeType?: BlogType;
  selectedCategory?: string;
  onTypeChange?: (type: BlogType) => void;
  onCategoryChange?: (category: string) => void;
  showFilters?: boolean;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  activeType = 'latest',
  selectedCategory = 'all',
  onTypeChange,
  onCategoryChange,
  showFilters = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { data: categories } = useBlogCategories();

  // Allow all authenticated users to create blog posts
  // Admin users can always create, plus anyone with blogger role
  const isBlogger = !!user; // All logged-in users can create blog posts

  const typeFilters = [
    { key: 'latest' as BlogType, label: 'Latest', icon: Clock },
    { key: 'popular' as BlogType, label: 'Popular', icon: TrendingUp },
    { key: 'featured' as BlogType, label: 'Featured', icon: Award },
    { key: 'all' as BlogType, label: 'All Posts', icon: Filter },
  ];

  const handleTypeChange = (type: BlogType) => {
    if (onTypeChange) {
      onTypeChange(type);
    } else {
      navigate(`/blog?type=${type}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      navigate(`/blog?category=${category}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-8 space-y-6">
        {/* Navigation Links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-primary-lime" />
            <h3 className="font-semibold text-text-primary text-sm">Navigation</h3>
          </div>
          <nav className="space-y-1">
            <Link
              to="/blog"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/blog')
                  ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <List size={16} />
                All Posts
              </span>
              {isActive('/blog') && <ChevronRight size={14} className="text-primary-lime" />}
            </Link>
            {isBlogger && (
              <>
                <Link
                  to="/blog/my-posts"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/blog/my-posts')
                      ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText size={16} />
                    My Posts
                  </span>
                  {isActive('/blog/my-posts') && <ChevronRight size={14} className="text-primary-lime" />}
                </Link>
                <Link
                  to="/blog/create"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/blog/create')
                      ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <PenLine size={16} />
                    Create Post
                  </span>
                  {isActive('/blog/create') && <ChevronRight size={14} className="text-primary-lime" />}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Browse Section */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-primary-lime" />
              <h3 className="font-semibold text-text-primary text-sm">Browse</h3>
            </div>
            <nav className="space-y-1">
              {typeFilters.map((filter) => {
                const Icon = filter.icon;
                const isActiveFilter = activeType === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => handleTypeChange(filter.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActiveFilter
                        ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={16} className={isActiveFilter ? 'text-primary-lime' : ''} />
                      {filter.label}
                    </span>
                    {isActiveFilter && <ChevronRight size={14} className="text-primary-lime" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-4 h-4 text-accent-blue" />
            <h3 className="font-semibold text-text-primary text-sm">Categories</h3>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Tag size={14} />
                All Categories
              </span>
              {selectedCategory === 'all' && <ChevronRight size={14} className="text-primary-lime" />}
            </button>
            {(categories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.name || selectedCategory === cat.slug
                    ? 'bg-primary-lime/10 text-primary-lime border border-primary-lime/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Tag size={14} />
                  {cat.name}
                </span>
                {(selectedCategory === cat.name || selectedCategory === cat.slug) && <ChevronRight size={14} className="text-primary-lime" />}
              </button>
            ))}
          </nav>
        </div>

        {/* New Post CTA */}
        {isBlogger && !isActive('/blog/create') && (
          <div className="bg-gradient-to-br from-primary-lime/10 to-accent-blue/10 rounded-xl border border-primary-lime/20 p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Share Your Ideas</h3>
            <p className="text-text-secondary text-xs mb-3">Create a new blog post and share with the community</p>
            <Link to="/blog/create">
              <Button className="w-full bg-primary-lime hover:bg-primary-lime/90 text-white border-0" size="sm">
                <Plus size={16} className="mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default BlogSidebar;
