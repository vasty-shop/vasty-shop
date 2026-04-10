/**
 * ImageUpload Component Test Page
 *
 * This is a dedicated test page to showcase and test the ImageUpload component
 * in the vendor panel. Access this page to see all features in action.
 *
 * To use this page, add a route in your router configuration:
 * <Route path="/vendor/test/image-upload" element={<ImageUploadTestPage />} />
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageUpload, UploadedImage } from '../components/ImageUpload';
import { GlassCard } from '../components/GlassCard';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Info,
  Code,
  Eye
} from 'lucide-react';

export const ImageUploadTestPage: React.FC = () => {
  // ============================================================================
  // State
  // ============================================================================

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [config, setConfig] = useState({
    maxFiles: 10,
    maxFileSize: 5, // in MB
    showDimensions: true,
    disabled: false
  });

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleImageChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to remove all images?')) {
      setImages([]);
    }
  };

  const handleLoadSample = () => {
    // Load sample images for testing
    const sampleImages: UploadedImage[] = [
      {
        id: 'sample_1',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
        fileName: 'premium-watch.jpg',
        fileSize: 245678,
        isPrimary: true,
        order: 0
      },
      {
        id: 'sample_2',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        fileName: 'wireless-headphones.jpg',
        fileSize: 198765,
        isPrimary: false,
        order: 1
      },
      {
        id: 'sample_3',
        url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
        fileName: 'designer-sunglasses.jpg',
        fileSize: 312456,
        isPrimary: false,
        order: 2
      }
    ];

    setImages(sampleImages);
  };

  // ============================================================================
  // Code Example
  // ============================================================================

  const codeExample = `import { ImageUpload } from '@/features/vendor/components/ImageUpload';

const [images, setImages] = useState<UploadedImage[]>([]);

<ImageUpload
  images={images}
  onChange={setImages}
  maxFiles={${config.maxFiles}}
  maxFileSize={${config.maxFileSize * 1024 * 1024}} // ${config.maxFileSize}MB
  showDimensions={${config.showDimensions}}
  disabled={${config.disabled}}
/>`;

  // ============================================================================
  // Stats
  // ============================================================================

  const stats = {
    totalImages: images.length,
    primaryImage: images.find(img => img.isPrimary)?.fileName || 'None',
    totalSize: images.reduce((sum, img) => sum + img.fileSize, 0),
    remainingSlots: config.maxFiles - images.length
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            ImageUpload Component Test
          </h1>
          <p className="text-white/60 mt-2">
            Test and preview the ImageUpload component with various configurations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 glass hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-all flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Load Sample</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 glass hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-all"
            disabled={images.length === 0}
          >
            Reset All
          </button>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass rounded-2xl border border-blue-400/30 bg-blue-400/10 p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Test Page Information
              </h3>
              <p className="text-white/70 text-sm mb-3">
                This page is designed to test and showcase the ImageUpload component.
                Try uploading images, reordering them, setting primary images, and testing
                various configurations.
              </p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Drag and drop images or click to browse</span>
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Set primary image by clicking the star icon</span>
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Reorder images by dragging them</span>
                </li>
                <li className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Remove images by clicking the X button</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Upload Images</h2>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center space-x-2 px-3 py-2 glass hover:bg-white/10 rounded-lg text-sm text-white/80 hover:text-white transition-all"
                >
                  <Code className="w-4 h-4" />
                  <span>{showCode ? 'Hide' : 'Show'} Code</span>
                </button>
              </div>

              {showCode && (
                <div className="mb-6">
                  <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-xs text-white/80 border border-white/10">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              )}

              <ImageUpload
                images={images}
                onChange={handleImageChange}
                maxFiles={config.maxFiles}
                maxFileSize={config.maxFileSize * 1024 * 1024}
                showDimensions={config.showDimensions}
                disabled={config.disabled}
              />
            </GlassCard>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Total Images</p>
                  <p className="text-2xl font-bold text-white">{stats.totalImages}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Remaining Slots</p>
                  <p className="text-2xl font-bold text-white">{stats.remainingSlots}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Total Size</p>
                  <p className="text-lg font-bold text-white">{formatBytes(stats.totalSize)}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Status</p>
                  <div className="flex items-center space-x-2">
                    {images.length > 0 ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Empty</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <p className="text-sm font-medium text-purple-400">Primary Image</p>
                  </div>
                  <p className="text-white text-sm truncate">{stats.primaryImage}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar - Configuration */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard hover={false}>
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Configuration</h3>
              </div>

              <div className="space-y-6">
                {/* Max Files */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max Files: {config.maxFiles}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={config.maxFiles}
                    onChange={(e) => setConfig({ ...config, maxFiles: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <p className="text-xs text-white/50 mt-1">Maximum number of images allowed</p>
                </div>

                {/* Max File Size */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max File Size: {config.maxFileSize}MB
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig({ ...config, maxFileSize: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <p className="text-xs text-white/50 mt-1">Maximum file size per image</p>
                </div>

                {/* Show Dimensions */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Show Dimensions</p>
                    <p className="text-xs text-white/50 mt-1">Display recommended dimensions</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, showDimensions: !config.showDimensions })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${config.showDimensions ? 'bg-purple-500' : 'bg-white/20'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${config.showDimensions ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Disabled */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Disabled State</p>
                    <p className="text-xs text-white/50 mt-1">Disable all interactions</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, disabled: !config.disabled })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${config.disabled ? 'bg-red-500' : 'bg-white/20'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${config.disabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Debug Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-white mb-4">Debug Info</h3>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Component State</p>
                  <pre className="text-xs text-white/80 overflow-x-auto">
                    {JSON.stringify({ imageCount: images.length, config }, null, 2)}
                  </pre>
                </div>

                {images.length > 0 && (
                  <div className="p-3 rounded-lg bg-black/30 border border-white/10 max-h-64 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-white/50 mb-2">Images Array</p>
                    <pre className="text-xs text-white/80">
                      {JSON.stringify(images.map(img => ({
                        id: img.id,
                        fileName: img.fileName,
                        isPrimary: img.isPrimary,
                        order: img.order
                      })), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadTestPage;
