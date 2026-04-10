import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Play,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Media item type for gallery
 */
export type MediaType = 'image' | 'video' | '360';

export interface GalleryMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface ProductImageGalleryProps {
  media: GalleryMedia[];
  productName: string;
  className?: string;
  /**
   * Initial selected media index
   */
  initialIndex?: number;
  /**
   * Enable/disable zoom functionality
   */
  enableZoom?: boolean;
  /**
   * Enable/disable lightbox mode
   */
  enableLightbox?: boolean;
  /**
   * Thumbnail position: horizontal (bottom) or vertical (right)
   */
  thumbnailPosition?: 'horizontal' | 'vertical';
  /**
   * Number of visible thumbnails
   */
  visibleThumbnails?: number;
  /**
   * Callbacks
   */
  onMediaChange?: (index: number) => void;
  onZoomChange?: (isZoomed: boolean) => void;
}

/**
 * ProductImageGallery Component
 *
 * A comprehensive image gallery component for product details with:
 * - Large main image display with zoom
 * - Thumbnail navigation strip
 * - Lightbox/full-screen mode
 * - Video and 360° view support
 * - Touch gestures for mobile
 * - Smooth animations
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  media,
  productName,
  className,
  initialIndex = 0,
  enableZoom = true,
  enableLightbox = true,
  thumbnailPosition = 'horizontal',
  visibleThumbnails = 4,
  onMediaChange,
  onZoomChange,
}) => {
  // State management
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [zoomPosition, setZoomPosition] = React.useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState<Record<string, boolean>>({});
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [is360Rotating] = React.useState(false);

  // Refs
  const mainImageRef = React.useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const touchStartRef = React.useRef({ x: 0, y: 0, distance: 0 });

  // Current media item
  const currentMedia = media[currentIndex];

  // Navigate to specific index
  const navigateToIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < media.length) {
        setCurrentIndex(index);
        setIsZoomed(false);
        setZoomLevel(1);
        setIsVideoPlaying(false);
        onMediaChange?.(index);
      }
    },
    [media.length, onMediaChange]
  );

  // Navigate to previous media
  const goToPrevious = React.useCallback(() => {
    navigateToIndex(currentIndex > 0 ? currentIndex - 1 : media.length - 1);
  }, [currentIndex, media.length, navigateToIndex]);

  // Navigate to next media
  const goToNext = React.useCallback(() => {
    navigateToIndex(currentIndex < media.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, media.length, navigateToIndex]);

  // Handle zoom toggle
  const toggleZoom = React.useCallback(() => {
    const newZoomState = !isZoomed;
    setIsZoomed(newZoomState);
    if (!newZoomState) {
      setZoomLevel(1);
      setZoomPosition({ x: 50, y: 50 });
    }
    onZoomChange?.(newZoomState);
  }, [isZoomed, onZoomChange]);

  // Handle zoom in
  const zoomIn = React.useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
    onZoomChange?.(true);
  }, [onZoomChange]);

  // Handle zoom out
  const zoomOut = React.useCallback(() => {
    const newZoomLevel = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoomLevel);
    if (newZoomLevel === 1) {
      setIsZoomed(false);
      onZoomChange?.(false);
    }
  }, [zoomLevel, onZoomChange]);

  // Handle mouse move for zoom
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !mainImageRef.current) return;

      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setZoomPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    },
    [isZoomed]
  );

  // Handle touch start for gestures
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - prepare for swipe
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: 0,
      };
    } else if (e.touches.length === 2) {
      // Two fingers - prepare for pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { x: 0, y: 0, distance };
    }
  }, []);

  // Handle touch move for gestures
  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && enableZoom) {
        // Pinch zoom
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        if (touchStartRef.current.distance > 0) {
          const scale = currentDistance / touchStartRef.current.distance;
          const newZoomLevel = Math.max(1, Math.min(3, zoomLevel * scale));
          setZoomLevel(newZoomLevel);
          setIsZoomed(newZoomLevel > 1);
          touchStartRef.current.distance = currentDistance;
        }
      }
    },
    [enableZoom, zoomLevel]
  );

  // Handle touch end for swipe
  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (e.changedTouches.length === 1 && touchStartRef.current.distance === 0) {
        const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);

        // Swipe threshold and vertical movement check
        if (Math.abs(deltaX) > 50 && deltaY < 50) {
          if (deltaX > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
        }
      }
    },
    [goToNext, goToPrevious]
  );

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        } else if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToNext, goToPrevious]);

  // Scroll thumbnail into view
  React.useEffect(() => {
    if (thumbnailContainerRef.current) {
      const thumbnails = thumbnailContainerRef.current.children;
      const activeThumbnail = thumbnails[currentIndex] as HTMLElement;
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  // Handle video playback
  const toggleVideoPlayback = React.useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  // Render media content
  const renderMediaContent = (
    media: GalleryMedia,
    isMain: boolean = true
  ) => {
    const imageStyle = isMain && isZoomed
      ? {
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
        }
      : {};

    switch (media.type) {
      case 'video':
        return (
          <div className="relative w-full h-full">
            <video
              ref={isMain ? videoRef : undefined}
              src={media.url}
              className="w-full h-full object-cover"
              loop
              playsInline
            />
            {isMain && !isVideoPlaying && (
              <motion.button
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                onClick={toggleVideoPlayback}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="w-10 h-10 text-text-primary ml-1" />
                </div>
              </motion.button>
            )}
          </div>
        );

      case '360':
        return (
          <div className="relative w-full h-full">
            <img
              src={media.url}
              alt={media.alt || productName}
              className={cn(
                'w-full h-full object-cover transition-all duration-300',
                imageLoaded[media.id] ? 'scale-100 blur-0' : 'scale-110 blur-md'
              )}
              style={imageStyle}
              onLoad={() =>
                setImageLoaded((prev) => ({ ...prev, [media.id]: true }))
              }
              draggable={false}
            />
            {isMain && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: is360Rotating ? 0 : 1 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-2 text-text-primary">
                    <RotateCw className="w-5 h-5" />
                    <span className="text-sm font-semibold">Drag to rotate 360°</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'image':
      default:
        return (
          <img
            src={media.url}
            alt={media.alt || productName}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              imageLoaded[media.id] ? 'scale-100 blur-0' : 'scale-110 blur-md',
              isZoomed && 'cursor-zoom-out',
              !isZoomed && enableZoom && 'cursor-zoom-in'
            )}
            style={imageStyle}
            onLoad={() =>
              setImageLoaded((prev) => ({ ...prev, [media.id]: true }))
            }
            draggable={false}
          />
        );
    }
  };

  // Render thumbnail
  const renderThumbnail = (item: GalleryMedia, index: number) => {
    const isActive = index === currentIndex;
    const thumbnailUrl = item.thumbnail || item.url;

    return (
      <motion.button
        key={item.id}
        className={cn(
          'relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300',
          'border-2 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:ring-offset-2',
          thumbnailPosition === 'horizontal' ? 'w-20 h-20' : 'w-full aspect-square',
          isActive
            ? 'border-primary-lime shadow-lg scale-105'
            : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
        )}
        onClick={() => navigateToIndex(index)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={thumbnailUrl}
          alt={`${productName} - ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Loading skeleton */}
        {!imageLoaded[item.id] && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Media type indicator */}
        {item.type !== 'image' && (
          <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5">
            {item.type === 'video' && (
              <Play className="w-3 h-3 text-white" fill="white" />
            )}
            {item.type === '360' && (
              <RotateCw className="w-3 h-3 text-white" />
            )}
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute inset-0 border-2 border-primary-lime rounded-xl pointer-events-none"
            layoutId="activeThumbnail"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <>
      {/* Main Gallery */}
      <div
        className={cn(
          'flex gap-4',
          thumbnailPosition === 'horizontal' ? 'flex-col' : 'flex-row-reverse',
          className
        )}
      >
        {/* Main Image Container */}
        <div className="relative flex-1">
          <motion.div
            ref={mainImageRef}
            className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden shadow-card"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (currentMedia.type === 'image' && enableZoom) {
                toggleZoom();
              }
            }}
          >
            {/* Loading skeleton */}
            {!imageLoaded[currentMedia.id] && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              </div>
            )}

            {/* Media content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMedia.id}
                className="w-full h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {renderMediaContent(currentMedia, true)}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg
                           opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg
                           opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Control Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Zoom Controls */}
              {enableZoom && currentMedia.type === 'image' && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomIn();
                    }}
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      zoomOut();
                    }}
                    disabled={zoomLevel <= 1}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Lightbox Button */}
              {enableLightbox && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Image Counter */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                            bg-black/70 backdrop-blur-sm text-white px-4 py-2
                            rounded-full text-sm font-semibold shadow-lg">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </motion.div>
        </div>

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div
            className={cn(
              'relative',
              thumbnailPosition === 'horizontal' ? 'w-full' : 'w-24'
            )}
          >
            <div
              ref={thumbnailContainerRef}
              className={cn(
                'flex gap-3 overflow-x-auto scrollbar-hide',
                thumbnailPosition === 'horizontal'
                  ? 'flex-row pb-2'
                  : 'flex-col max-h-[600px]'
              )}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {media.map((item, index) => renderThumbnail(item, index))}
            </div>

            {/* Scroll fade indicators */}
            {media.length > visibleThumbnails && (
              <>
                <div
                  className={cn(
                    'absolute bg-gradient-to-r from-white to-transparent pointer-events-none',
                    thumbnailPosition === 'horizontal'
                      ? 'left-0 top-0 bottom-0 w-8'
                      : 'top-0 left-0 right-0 h-8 bg-gradient-to-b'
                  )}
                />
                <div
                  className={cn(
                    'absolute bg-gradient-to-l from-white to-transparent pointer-events-none',
                    thumbnailPosition === 'horizontal'
                      ? 'right-0 top-0 bottom-0 w-8'
                      : 'bottom-0 left-0 right-0 h-8 bg-gradient-to-t'
                  )}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && enableLightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-lg z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Lightbox Image */}
            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia.id}
                  className="w-full h-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative w-full h-full">
                    {renderMediaContent(currentMedia, true)}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Counter */}
              {media.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2
                              bg-white/10 backdrop-blur-sm text-white px-6 py-3
                              rounded-full text-sm font-semibold">
                  {currentIndex + 1} / {media.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide scrollbar globally */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ProductImageGallery;
