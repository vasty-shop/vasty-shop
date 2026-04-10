import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JoditEditor from 'jodit-react';
import {
  ArrowLeft, Save, Send, Image as ImageIcon, X, Plus, Tag, PenSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBlogCategories, useCreateBlogPost, useUploadBlogImages, useCreateCategory } from './hooks/useBlog';
import { BlogSidebar } from './components';
import { CreateBlogPostDto } from './types';
import { toast } from 'sonner';

const CreateBlog: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const editorRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  const { data: categories, refetch: refetchCategories } = useBlogCategories();
  const createPostMutation = useCreateBlogPost();
  const uploadImagesMutation = useUploadBlogImages();
  const createCategoryMutation = useCreateCategory();

  // Jodit Editor config
  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: 'Write your blog post content here...',
    height: 400,
    theme: 'default',
    toolbarButtonSize: 'middle' as const,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'paragraph', '|',
      'align', '|',
      'link', 'image', 'video', '|',
      'hr', 'table', '|',
      'undo', 'redo', '|',
      'source', 'fullsize'
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    removeButtons: ['about'],
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
  }), []);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const result = await uploadImagesMutation.mutateAsync(Array.from(files));
      setImageUrls([...imageUrls, ...result.urls]);
      toast.success('Images uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    }
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter(img => img !== url));
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__custom__') {
      setShowCustomCategory(true);
      setCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(value);
    }
  };

  const handleAddCustomCategory = async () => {
    const trimmedName = customCategoryName.trim();
    if (!trimmedName) {
      toast.error('Please enter a category name');
      return;
    }

    // Check if category already exists
    const exists = (categories || []).some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      toast.error('This category already exists');
      return;
    }

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: trimmedName,
        description: '',
      });
      await refetchCategories();
      setCategory(newCategory.name);
      setCustomCategoryName('');
      setShowCustomCategory(false);
      toast.success('Category created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    const postData: CreateBlogPostDto = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      category: category || undefined,
      tags: tags.length > 0 ? tags : undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      status,
      featured,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    };

    try {
      const post = await createPostMutation.mutateAsync(postData);
      toast.success(status === 'published' ? 'Post published successfully!' : 'Draft saved successfully!');
      navigate(`/blog/${post.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  // Allow all authenticated users to create blog posts
  const isBlogger = !!user;

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
            <PenSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in</h2>
            <p className="text-text-secondary mb-6">You need to be logged in to create a blog post.</p>
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
            <PenSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h2>
            <p className="text-text-secondary mb-6">You need the blogger role to create posts.</p>
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
                { label: 'Create Post' },
              ]}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/blog')}
                className="flex items-center gap-2 text-text-secondary hover:text-primary-lime transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-text-primary">Create New Post</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={createPostMutation.isPending}
                className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
              >
                <Save size={16} className="mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={createPostMutation.isPending}
                className="bg-primary-lime hover:bg-primary-lime/90 text-white"
              >
                {createPostMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <BlogSidebar showFilters={false} />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your blog post title"
                    className="border-gray-200 text-text-primary text-lg focus:border-primary-lime"
                  />
                </div>

                {/* Excerpt */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A short summary of your post (optional)"
                    rows={3}
                    className="w-full bg-white border border-gray-200 text-text-primary rounded-lg p-3 text-sm focus:border-primary-lime focus:ring-1 focus:ring-primary-lime/20 outline-none resize-none"
                  />
                </div>

                {/* Content Editor */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Content *
                  </label>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <JoditEditor
                      ref={editorRef}
                      value={content}
                      config={editorConfig}
                      onBlur={(newContent) => setContent(newContent)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={showCustomCategory ? '__custom__' : category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-text-primary rounded-lg p-3 text-sm focus:border-primary-lime focus:ring-1 focus:ring-primary-lime/20 outline-none"
                  >
                    <option value="">Select a category</option>
                    {(categories || []).map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Custom Category</option>
                  </select>

                  {showCustomCategory && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 border-gray-200 text-text-primary text-sm focus:border-primary-lime"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomCategory}
                        disabled={createCategoryMutation.isPending}
                        className="bg-primary-lime hover:bg-primary-lime/90 text-white"
                      >
                        {createCategoryMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategoryName('');
                        }}
                        className="border-gray-200 text-gray-700 hover:bg-gray-100"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag size={12} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-400 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a tag and press Enter"
                      className="border-gray-200 text-text-primary text-sm focus:border-primary-lime"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Images */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Featured Images
                  </label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveImage(url)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImageIcon size={16} className="text-gray-500" />
                    <span className="text-sm text-text-secondary">Upload Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadImagesMutation.isPending && (
                    <span className="ml-3 text-sm text-text-secondary">Uploading...</span>
                  )}
                </div>

                {/* SEO */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Meta Title
                      </label>
                      <Input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="SEO title (defaults to post title)"
                        className="border-gray-200 text-text-primary text-sm focus:border-primary-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="SEO description (defaults to excerpt)"
                        rows={2}
                        className="w-full bg-white border border-gray-200 text-text-primary rounded-lg p-3 text-sm focus:border-primary-lime focus:ring-1 focus:ring-primary-lime/20 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 bg-white text-primary-lime focus:ring-primary-lime/20"
                    />
                    <span className="text-sm text-text-secondary">Mark as Featured Post</span>
                  </label>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateBlog;
