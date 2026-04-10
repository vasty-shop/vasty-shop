import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronRight, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { api } from '@/lib/api';

interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  content: {
    body?: string;
    sections?: Array<{ title?: string; content: string }>;
  };
  metaTitle?: string;
  metaDescription?: string;
  template: string;
  headerImage?: string;
  showBreadcrumb: boolean;
  showTableOfContents: boolean;
  status: string;
  publishedAt?: string;
  updatedAt: string;
}

export const CmsPageViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError('Page not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await api.getPageContent(slug);
        setPage(data);
      } catch (err: any) {
        console.error('[CmsPageViewer] Failed to fetch page:', err);
        setError(err?.response?.status === 404 ? 'Page not found' : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  useEffect(() => {
    // Update document title
    if (page?.metaTitle || page?.title) {
      document.title = `${page.metaTitle || page.title} | Vasty`;
    }

    // Update meta description
    if (page?.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', page.metaDescription);
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-primary-lime animate-spin" />
            <p className="text-text-secondary">Loading page...</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              {error === 'Page not found' ? 'Page Not Found' : 'Something Went Wrong'}
            </h1>
            <p className="text-text-secondary mb-8">
              {error === 'Page not found'
                ? "The page you're looking for doesn't exist or has been moved."
                : 'We encountered an error while loading this page. Please try again later.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-lime text-white font-medium rounded-lg hover:bg-primary-lime-dark transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Home
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-text-primary font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = page.showBreadcrumb
    ? [{ label: page.title }]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb */}
      {page.showBreadcrumb && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <BreadcrumbNavigation items={breadcrumbItems} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16"
        style={
          page.headerImage
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url(${page.headerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
            {page.metaDescription && (
              <p className="text-lg text-gray-300 mb-6">{page.metaDescription}</p>
            )}
            {page.publishedAt && (
              <div className="text-sm text-gray-400">
                Last updated: {formatDate(page.updatedAt)}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 shadow-sm"
            >
              {/* Render content body as HTML */}
              {page.content?.body && (
                <div
                  className="prose prose-slate max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary-lime prose-strong:text-text-primary prose-li:text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: page.content.body }}
                />
              )}

              {/* Render content sections if available */}
              {page.content?.sections && page.content.sections.length > 0 && (
                <div className="space-y-8">
                  {page.content.sections.map((section, index) => (
                    <div key={index} className="scroll-mt-24">
                      {section.title && (
                        <h2 className="text-2xl font-bold text-text-primary mb-4 pb-2 border-b-2 border-primary-lime/30">
                          {section.title}
                        </h2>
                      )}
                      <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty content fallback */}
              {!page.content?.body && (!page.content?.sections || page.content.sections.length === 0) && (
                <div className="text-center py-12 text-text-secondary">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>This page doesn't have any content yet.</p>
                </div>
              )}
            </motion.div>

            {/* Print-friendly note */}
            <div className="mt-6 text-center text-sm text-text-secondary print:hidden">
              <p>
                Want to save this page?{' '}
                <button
                  onClick={() => window.print()}
                  className="text-primary-lime hover:underline font-medium"
                >
                  Print this page
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary-lime text-white rounded-full shadow-lg hover:bg-primary-lime-dark transition-all duration-300 z-40 print:hidden"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default CmsPageViewer;
