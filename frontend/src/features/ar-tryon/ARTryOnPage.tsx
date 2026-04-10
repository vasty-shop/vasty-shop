import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ARTryOnView from './components/ARTryOnView';
import { ARProvider } from './context/ARContext';

interface Product {
  id: string;
  name: string;
  brand?: string;
  images: string[];
  price: number;
  salePrice?: number;
  variants?: Array<{
    id: string;
    name: string;
    color?: string;
    image?: string;
  }>;
}

export const ARTryOnPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getProduct(id);
        setProduct(response.data || response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-white/80">{t('ar.loading')}</p>
        </motion.div>
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] gap-6 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || t('ar.productNotFound')}
          </h2>
          <p className="text-white/60 mb-6">
            {t('ar.couldNotLoadAR')}
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('ar.goBack')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <ARProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
        <ARTryOnView
          productId={product.id}
          onClose={() => navigate(-1)}
        />
      </div>
    </ARProvider>
  );
};

export default ARTryOnPage;
