import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Upload,
  X,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  GripVertical,
  AlertTriangle,
  FileWarning
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  isPrimary: boolean;
  order: number;
  file?: File;
}

export interface ImageUploadState {
  images: UploadedImage[];
  uploading: boolean;
  progress: Record<string, number>;
  errors: Record<string, string>;
}

export interface ImageUploadProps {
  images?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
  onUpload?: (file: File) => Promise<{ url: string; thumbnailUrl?: string }>;
  disabled?: boolean;
  showDimensions?: boolean;
  recommendedDimensions?: { width: number; height: number };
}

interface ValidationError {
  type: 'size' | 'format' | 'count' | 'dimensions';
  message: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const generateId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validateImage = (
  file: File,
  maxFileSize: number,
  acceptedFormats: string[]
): ValidationError | null => {
  // Check file size
  if (file.size > maxFileSize) {
    return {
      type: 'size',
      message: `File size exceeds ${formatFileSize(maxFileSize)}`
    };
  }

  // Check file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type;

  const isValidFormat = acceptedFormats.some(format => {
    const formatLower = format.toLowerCase().replace('.', '');
    return fileExtension === formatLower || mimeType.includes(formatLower);
  });

  if (!isValidFormat) {
    return {
      type: 'format',
      message: `Invalid format. Accepted: ${acceptedFormats.join(', ')}`
    };
  }

  return null;
};

const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

// ============================================================================
// Main Component
// ============================================================================

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images: initialImages = [],
  onChange,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.webp'],
  onUpload,
  disabled = false,
  showDimensions = true,
  recommendedDimensions = { width: 1200, height: 1200 }
}) => {
  // ============================================================================
  // State Management
  // ============================================================================

  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  // ============================================================================
  // File Upload Handler
  // ============================================================================

  const uploadFile = useCallback(
    async (file: File, imageId: string): Promise<void> => {
      const abortController = new AbortController();
      uploadAbortControllers.current.set(imageId, abortController);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const currentProgress = prev[imageId] || 0;
            if (currentProgress >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [imageId]: currentProgress + 10 };
          });
        }, 200);

        let uploadResult: { url: string; thumbnailUrl?: string };

        if (onUpload) {
          // Use custom upload handler
          uploadResult = await onUpload(file);
        } else {
          // Default: Create local URL (for preview only)
          // Note: In production, always provide an onUpload handler
          const url = URL.createObjectURL(file);
          uploadResult = { url, thumbnailUrl: url };
        }

        clearInterval(progressInterval);

        // Load image dimensions
        const dimensions = await loadImageDimensions(file);

        // Update image with upload result
        setImages(prev =>
          prev.map(img =>
            img.id === imageId
              ? {
                  ...img,
                  url: uploadResult.url,
                  thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
                  fileSize: file.size
                }
              : img
          )
        );

        // Complete progress
        setProgress(prev => ({ ...prev, [imageId]: 100 }));

        // Remove progress after delay
        setTimeout(() => {
          setProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[imageId];
            return newProgress;
          });
        }, 1000);

        // Remove error if exists
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[imageId];
          return newErrors;
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setErrors(prev => ({
            ...prev,
            [imageId]: error.message || 'Upload failed'
          }));
        }
      } finally {
        uploadAbortControllers.current.delete(imageId);
      }
    },
    [onUpload]
  );

  // ============================================================================
  // Drop Handler
  // ============================================================================

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled) return;

      // Handle rejected files
      rejectedFiles.forEach(rejection => {
        const { file, errors } = rejection;
        const errorMessage = errors.map((e: any) => e.message).join(', ');
        const tempId = generateId();
        setErrors(prev => ({ ...prev, [tempId]: errorMessage }));

        setTimeout(() => {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[tempId];
            return newErrors;
          });
        }, 5000);
      });

      // Check max files limit
      if (images.length + acceptedFiles.length > maxFiles) {
        const tempId = generateId();
        setErrors(prev => ({
          ...prev,
          [tempId]: `Maximum ${maxFiles} images allowed`
        }));

        setTimeout(() => {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[tempId];
            return newErrors;
          });
        }, 5000);
        return;
      }

      // Validate files
      const validFiles: Array<{ file: File; id: string }> = [];

      for (const file of acceptedFiles) {
        const imageId = generateId();
        const validationError = validateImage(file, maxFileSize, acceptedFormats);

        if (validationError) {
          setErrors(prev => ({ ...prev, [imageId]: validationError.message }));
          setTimeout(() => {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[imageId];
              return newErrors;
            });
          }, 5000);
        } else {
          validFiles.push({ file, id: imageId });
        }
      }

      if (validFiles.length === 0) return;

      // Create placeholder images
      const newImages: UploadedImage[] = validFiles.map(({ file, id }, index) => ({
        id,
        url: '',
        fileName: file.name,
        fileSize: file.size,
        isPrimary: images.length === 0 && index === 0,
        order: images.length + index,
        file
      }));

      setImages(prev => [...prev, ...newImages]);
      setUploading(true);

      // Upload files
      await Promise.all(
        validFiles.map(({ file, id }) => uploadFile(file, id))
      );

      setUploading(false);
    },
    [images, maxFiles, maxFileSize, acceptedFormats, disabled, uploadFile]
  );

  // ============================================================================
  // Dropzone Configuration
  // ============================================================================

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: maxFileSize,
    disabled,
    multiple: true
  });

  // ============================================================================
  // Image Management Functions
  // ============================================================================

  const removeImage = useCallback((imageId: string) => {
    // Cancel upload if in progress
    const abortController = uploadAbortControllers.current.get(imageId);
    if (abortController) {
      abortController.abort();
      uploadAbortControllers.current.delete(imageId);
    }

    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      // If removed image was primary, make first image primary
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      // Reorder
      return filtered.map((img, index) => ({ ...img, order: index }));
    });

    // Remove progress and error
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[imageId];
      return newProgress;
    });

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[imageId];
      return newErrors;
    });
  }, []);

  const setPrimaryImage = useCallback((imageId: string) => {
    setImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    );
  }, []);

  const retryUpload = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image && image.file) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[imageId];
        return newErrors;
      });
      uploadFile(image.file, imageId);
    }
  }, [images, uploadFile]);

  const handleReorder = useCallback((newOrder: UploadedImage[]) => {
    const reordered = newOrder.map((img, index) => ({ ...img, order: index }));
    setImages(reordered);
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  React.useEffect(() => {
    if (onChange) {
      onChange(images);
    }
  }, [images, onChange]);

  // ============================================================================
  // Render
  // ============================================================================

  const hasErrors = Object.keys(errors).length > 0;
  const canAddMore = images.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canAddMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden rounded-2xl border-2 border-dashed
              transition-all duration-300 cursor-pointer
              ${
                isDragActive
                  ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                  : 'border-white/20 glass-solid hover:border-purple-400/50 hover:bg-white/5'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />

            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 p-12 text-center">
              <motion.div
                animate={{
                  y: isDragActive ? -10 : 0,
                  scale: isDragActive ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div
                    className={`
                      p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500
                      shadow-lg transition-all duration-300
                      ${isDragActive ? 'shadow-purple-500/50' : 'shadow-purple-500/30'}
                    `}
                  >
                    <Upload className="w-12 h-12 text-white" />
                  </div>

                  {/* Animated ring */}
                  {isDragActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl border-4 border-purple-400"
                    />
                  )}
                </div>
              </motion.div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Drop images here' : 'Upload Product Images'}
              </h3>

              <p className="text-white/60 mb-4">
                Drag and drop images here, or click to browse
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/50">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Max {maxFiles} images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Up to {formatFileSize(maxFileSize)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{acceptedFormats.join(', ').toUpperCase()}</span>
                </div>
              </div>

              {showDimensions && recommendedDimensions && (
                <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/60">
                    Recommended: {recommendedDimensions.width}x{recommendedDimensions.height}px
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Messages */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {Object.entries(errors).map(([id, error]) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[id];
                      return newErrors;
                    });
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Images Grid */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Uploaded Images ({images.length}/{maxFiles})
            </h4>
            {images.length > 1 && (
              <p className="text-sm text-white/60 flex items-center space-x-2">
                <GripVertical className="w-4 h-4" />
                <span>Drag to reorder</span>
              </p>
            )}
          </div>

          <Reorder.Group
            axis="y"
            values={images}
            onReorder={handleReorder}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {images.map((image) => {
                const isUploading = progress[image.id] !== undefined && progress[image.id] < 100;
                const uploadProgress = progress[image.id] || 0;
                const hasError = errors[image.id] !== undefined;

                return (
                  <Reorder.Item
                    key={image.id}
                    value={image}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    dragListener={!isUploading && !disabled}
                    className={`
                      glass-solid rounded-xl overflow-hidden
                      ${!isUploading && !disabled ? 'cursor-grab active:cursor-grabbing' : ''}
                    `}
                  >
                    <div className="relative">
                      <div className="flex items-center space-x-4 p-4">
                        {/* Drag Handle */}
                        {!isUploading && !disabled && (
                          <div className="shrink-0 text-white/40 hover:text-white/60 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>
                        )}

                        {/* Image Preview */}
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            {image.url ? (
                              <img
                                src={image.thumbnailUrl || image.url}
                                alt={image.fileName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {isUploading ? (
                                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-white/30" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Primary Badge */}
                          {image.isPrimary && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                            >
                              <Star className="w-3 h-3 text-white" fill="currentColor" />
                            </motion.div>
                          )}
                        </div>

                        {/* Image Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate mb-1">
                            {image.fileName}
                          </p>
                          <p className="text-xs text-white/50">
                            {formatFileSize(image.fileSize)}
                          </p>

                          {/* Upload Progress */}
                          {isUploading && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-purple-400">Uploading...</span>
                                <span className="text-xs text-white/60">{uploadProgress}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {hasError && (
                            <div className="mt-2 flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                              <p className="text-xs text-red-400">{errors[image.id]}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {/* Set as Primary Button */}
                          {!image.isPrimary && !isUploading && !disabled && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPrimaryImage(image.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors group relative"
                              title="Set as primary image"
                            >
                              <Star className="w-5 h-5 text-white/40 group-hover:text-yellow-400 transition-colors" />
                            </motion.button>
                          )}

                          {/* Retry Button */}
                          {hasError && !isUploading && (
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 180 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => retryUpload(image.id)}
                              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                              title="Retry upload"
                            >
                              <RefreshCw className="w-5 h-5 text-purple-400" />
                            </motion.button>
                          )}

                          {/* Remove Button */}
                          {!isUploading && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeImage(image.id)}
                              disabled={disabled}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              title="Remove image"
                            >
                              <X className="w-5 h-5 text-red-400" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      )}

      {/* Empty State */}
      {images.length === 0 && !canAddMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileWarning className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No images uploaded yet</p>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;
