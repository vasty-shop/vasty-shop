import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  X,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  FileText,
  RefreshCw,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: {
    body?: string;
    sections?: Array<{ title?: string; content: string }>;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  template: string;
  headerImage?: string;
  showBreadcrumb: boolean;
  showTableOfContents: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  version: number;
  lastEditedBy?: string;
  isPublic: boolean;
  requiresAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export const CmsPagesPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    template: 'default',
    headerImage: '',
    showBreadcrumb: true,
    showTableOfContents: false,
    status: 'draft' as 'draft' | 'published',
    isPublic: true,
    requiresAuth: false
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch pages from API
  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.getCmsPages(statusFilter === 'archived');
      const data = response?.data || [];
      setPages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('[CmsPagesPage] Failed to fetch pages:', err);
      toast.error(t('admin.cms.failedToLoad'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  // Filter pages by status and search query
  const filteredPages = pages.filter((page) => {
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchesSearch = !searchQuery ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Paginate
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      template: 'default',
      headerImage: '',
      showBreadcrumb: true,
      showTableOfContents: false,
      status: 'draft',
      isPublic: true,
      requiresAuth: false
    });
  };

  // Open create new page modal
  const handleCreateNew = () => {
    resetForm();
    setSelectedPage(null);
    setIsCreatingNew(true);
    setShowEditorModal(true);
  };

  // Open edit page modal
  const handleEditPage = (page: CmsPage) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content?.body || JSON.stringify(page.content, null, 2),
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
      template: page.template || 'default',
      headerImage: page.headerImage || '',
      showBreadcrumb: page.showBreadcrumb,
      showTableOfContents: page.showTableOfContents,
      status: page.status === 'archived' ? 'draft' : page.status,
      isPublic: page.isPublic,
      requiresAuth: page.requiresAuth
    });
    setIsCreatingNew(false);
    setShowEditorModal(true);
  };

  // Save page (create or update)
  const handleSavePage = async () => {
    if (!formData.slug.trim() || !formData.title.trim()) {
      toast.error(t('admin.cms.validationError'), {
        description: t('admin.cms.slugTitleRequired')
      });
      return;
    }

    try {
      setActionLoading(true);

      const pageData = {
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        title: formData.title,
        content: { body: formData.content },
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        template: formData.template,
        headerImage: formData.headerImage || undefined,
        showBreadcrumb: formData.showBreadcrumb,
        showTableOfContents: formData.showTableOfContents,
        status: formData.status,
        isPublic: formData.isPublic,
        requiresAuth: formData.requiresAuth
      };

      if (isCreatingNew) {
        await api.createCmsPage(pageData);
        toast.success(t('admin.cms.pageCreated'));
      } else if (selectedPage) {
        await api.updateCmsPage(selectedPage.id, pageData);
        toast.success(t('admin.cms.pageUpdated'));
      }

      setShowEditorModal(false);
      resetForm();
      setSelectedPage(null);
      fetchPages();
    } catch (err: any) {
      toast.error(isCreatingNew ? t('admin.cms.failedToCreate') : t('admin.cms.failedToUpdate'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    const confirmed = await dialog.showConfirm({
      title: t('admin.cms.deletePage'),
      message: t('admin.cms.deletePageConfirm'),
      confirmText: t('admin.cms.delete'),
      cancelText: t('admin.common.cancel'),
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.deleteCmsPage(pageId);
      toast.success(t('admin.cms.pageDeleted'));
      fetchPages();
    } catch (err: any) {
      toast.error(t('admin.cms.failedToDelete'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Publish/Unpublish page
  const handleTogglePublish = async (page: CmsPage) => {
    const isPublishing = page.status !== 'published';

    try {
      setActionLoading(true);
      if (isPublishing) {
        await api.publishCmsPage(page.id);
        toast.success(t('admin.cms.pagePublished'));
      } else {
        await api.unpublishCmsPage(page.id);
        toast.success(t('admin.cms.pageUnpublished'));
      }
      fetchPages();
    } catch (err: any) {
      toast.error(t('admin.cms.failedToUpdateStatus'), {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading State
  if (loading && pages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.cms.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.cms.subtitle')} ({filteredPages.length} {t('admin.cms.allPages').toLowerCase()})
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPages}
            disabled={loading}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.common.refresh')}</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.cms.addPage')}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
              {(['all', 'draft', 'published', 'archived'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t(`admin.cms.${status}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      {paginatedPages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? t('admin.cms.noPagesFound') : t('admin.cms.noPagesYet')}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? t('admin.cms.noPagesMatch')
              : t('admin.cms.createFirstPage')}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateNew}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30"
            >
              {t('admin.cms.createFirstPageBtn')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.cms.pageTitle')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.cms.slug')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.cms.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.common.date')}</th>
                    <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPages.map((page, index) => (
                    <motion.tr
                      key={page.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      {/* Page Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{page.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {page.isPublic ? (
                                <Globe className="w-3 h-3 text-green-600" />
                              ) : (
                                <Lock className="w-3 h-3 text-yellow-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {page.isPublic ? t('admin.cms.public') : t('admin.cms.private')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="p-4">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-indigo-600">
                          /{page.slug}
                        </code>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(
                            page.status
                          )}`}
                        >
                          {t(`admin.cms.${page.status}`)}
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(page.updatedAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
                            title={t('admin.common.view')}
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleEditPage(page)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
                            title={t('admin.cms.editPage')}
                          >
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(page)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                              page.status === 'published'
                                ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                                : 'bg-green-50 hover:bg-green-100 border border-green-200'
                            }`}
                            title={page.status === 'published' ? t('admin.cms.draft') : t('admin.cms.published')}
                          >
                            {page.status === 'published' ? (
                              <XCircle className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            disabled={actionLoading}
                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                            title={t('admin.cms.deletePage')}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                {t('admin.cms.pageOf', { current: currentPage, total: totalPages })}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Page Editor Modal */}
      <AnimatePresence>
        {showEditorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditorModal(false);
              setSelectedPage(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setShowEditorModal(false);
                      setSelectedPage(null);
                      resetForm();
                    }}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isCreatingNew ? t('admin.cms.createNewPage') : t('admin.cms.editPage')}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {isCreatingNew ? t('admin.cms.addNewCmsPage') : `${t('admin.cms.editing')}: ${selectedPage?.title}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSavePage}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{actionLoading ? t('admin.cms.saving') : t('admin.cms.savePage')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowEditorModal(false);
                      setSelectedPage(null);
                      resetForm();
                    }}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.pageTitleLabel')}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('admin.cms.pageTitlePlaceholder')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.urlSlugLabel')}</label>
                    <div className="flex items-center">
                      <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">
                        /
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder={t('admin.cms.urlSlugPlaceholder')}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.pageContent')}</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={t('admin.cms.contentPlaceholder')}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm resize-none"
                  />
                </div>

                {/* SEO Settings */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span>{t('admin.cms.seoSettings')}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.metaTitle')}</label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder={t('admin.cms.metaTitlePlaceholder')}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.metaKeywords')}</label>
                      <input
                        type="text"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        placeholder={t('admin.cms.metaKeywordsPlaceholder')}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.metaDescription')}</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder={t('admin.cms.metaDescPlaceholder')}
                      rows={2}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Page Settings */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span>{t('admin.cms.pageSettings')}</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.showBreadcrumb}
                        onChange={(e) => setFormData({ ...formData, showBreadcrumb: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{t('admin.cms.showBreadcrumb')}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.showTableOfContents}
                        onChange={(e) => setFormData({ ...formData, showTableOfContents: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{t('admin.cms.tableOfContents')}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{t('admin.cms.publicPage')}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.requiresAuth}
                        onChange={(e) => setFormData({ ...formData, requiresAuth: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{t('admin.cms.requiresLogin')}</span>
                    </label>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.cms.pageStatus')}</label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                        className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                          formData.status === 'draft'
                            ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-700'
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{t('admin.cms.draft')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'published' })}
                        className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                          formData.status === 'published'
                            ? 'bg-green-100 border-2 border-green-400 text-green-700'
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('admin.cms.published')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};
