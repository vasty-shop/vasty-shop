import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Package,
  CheckCircle,
  XCircle,
  X,
  ChevronRight,
  Layers,
  Tag,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  productsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string | null;
  status: 'active' | 'inactive';
}

export const AdminCategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parentId: null,
    status: 'active'
  });

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await api.getCategories();
      const categoriesData: any[] = Array.isArray(response) ? response : (response?.data || []);

      // Transform API response to match Category interface
      const transformedCategories: Category[] = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name || 'Unnamed Category',
        slug: cat.slug || '',
        parentId: cat.parentId || cat.parent_id || null,
        parentName: cat.parent?.name || null,
        productsCount: cat.productCount || cat.productsCount || cat.products_count || 0,
        status: cat.isActive === false ? 'inactive' : 'active',
        createdAt: cat.createdAt || cat.created_at || new Date().toISOString()
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(t('admin.analytics.failedToLoad'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Stats calculations
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const inactiveCategories = categories.filter(c => c.status === 'inactive').length;

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle opening modal for adding new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: null,
      status: 'active'
    });
    setShowModal(true);
  };

  // Handle opening modal for editing category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      status: category.status
    });
    setShowModal(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (!window.confirm(t('admin.categories.deleteConfirm', { name: category.name }))) {
      return;
    }

    try {
      await api.deleteCategory(categoryId);
      toast.success(t('admin.categories.categoryDeleted'));
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || t('admin.categories.deleteFailed'));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId || undefined,
        isActive: formData.status === 'active'
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        toast.success(t('admin.categories.categoryUpdated'));
      } else {
        await api.createCategory(payload);
        toast.success(t('admin.categories.categoryCreated'));
      }

      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || t('admin.categories.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.categories.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.categories.subtitle')}
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>{t('admin.categories.addCategory')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.categories.allCategories')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCategories}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.common.active')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeCategories}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{t('admin.common.inactive')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{inactiveCategories}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-md">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <GlassCard hover={false} className="!bg-white">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.categories.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </GlassCard>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.categories.categoryName')}</th>
                <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.categories.parentCategory')}</th>
                <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.categories.productsCount')}</th>
                <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.categories.status')}</th>
                <th className="text-left p-4 text-sm text-gray-600 font-semibold">{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <p className="text-gray-500 font-medium">{t('admin.common.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FolderTree className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{t('admin.categories.noCategories')}</p>
                      <p className="text-gray-400 text-sm">
                        {searchQuery
                          ? t('admin.categories.noCategoriesMatch')
                          : t('admin.categories.createFirstCategory')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {category.parentName ? (
                        <div className="flex items-center space-x-1 text-gray-600">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <span>{category.parentName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">{t('admin.categories.rootCategory')}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{category.productsCount} {t('admin.categories.products')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.status === 'active' ? t('admin.common.active') : t('admin.common.inactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                          title={t('admin.categories.editTitle')}
                        >
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                          title={t('admin.categories.deleteTitle')}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addCategory')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.categories.categoryName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder={t('admin.categories.enterCategoryName')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.categories.slug')}
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder={t('admin.categories.categorySlugPlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.categories.autoGeneratedFromName')}
                    </p>
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.categories.parentCategory')}
                    </label>
                    <select
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    >
                      <option value="">{t('admin.categories.noneRootCategory')}</option>
                      {categories
                        .filter(c => c.id !== editingCategory?.id)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.categories.status')}
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData({ ...formData, status: 'active' })}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{t('admin.common.active')}</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={() => setFormData({ ...formData, status: 'inactive' })}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{t('admin.common.inactive')}</span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
                    >
                      {t('admin.common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addCategory')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
