import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  AlertCircle,
  RefreshCcw,
  Loader2,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ARTryOnViewProps, ARStatus, ARError, CameraFacing, Product, ProductVariant } from '../types';
import { ClothingItem, ClothingType, Pose, PoseLandmark } from '../types/ar-types';
import ARControls from './ARControls';
import ARProductSelector from './ARProductSelector';
import ARInstructions from './ARInstructions';
import { ClothingOverlay } from './ClothingOverlay';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { api } from '@/lib/api';

/**
 * Main AR Try-On View Component
 * Handles camera feed, pose detection, and clothing overlay
 */
const ARTryOnView: React.FC<ARTryOnViewProps> = ({ productId, onClose }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clothingImageRef = useRef<HTMLImageElement | null>(null);

  // Use custom hooks for camera and pose detection
  const {
    videoRef,
    isLoading: isCameraLoading,
    error: cameraError,
    isActive: isCameraActive,
    facingMode,
    startCamera,
    stopCamera,
    toggleCamera,
  } = useCamera();

  const {
    pose,
    isModelLoading,
    modelError,
    startDetection,
    stopDetection,
    isDetecting,
  } = usePoseDetection({ modelType: 'lite', enableSmoothing: true, flipHorizontal: facingMode === 'user' });

  // Determine if video should be mirrored (front camera / selfie mode)
  const isMirrored = facingMode === 'user';

  const [status, setStatus] = useState<ARStatus>('idle');
  const [error, setError] = useState<ARError | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [productSize, setProductSize] = useState(100);
  const [isCapturing, setIsCapturing] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [clothingLoaded, setClothingLoaded] = useState(false);

  // Product data from API
  const [product, setProduct] = useState<Product>({
    id: productId,
    name: 'Loading...',
    imageUrl: '',
    category: 'clothing',
    variants: [],
  });

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  // Clothing item for overlay
  const [clothingItem, setClothingItem] = useState<ClothingItem | null>(null);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setProductLoading(true);
        const response = await api.getProduct(productId);
        const productData = response.data || response;

        // Transform API response to match our Product interface
        const transformedProduct: Product = {
          id: productData.id || productData._id,
          name: productData.name,
          imageUrl: productData.images?.[0] || '',
          category: productData.category || 'clothing',
          variants: (productData.variants || productData.colors || []).map((v: any, index: number) => ({
            id: v.id || v._id || String(index + 1),
            name: v.name || v.color || `Variant ${index + 1}`,
            color: v.colorCode || v.hex || '#000000',
            imageUrl: v.image || productData.images?.[0] || '',
            thumbnail: v.thumbnail || v.image || productData.images?.[0] || '',
          })),
        };

        // If no variants, create default from product images
        if (transformedProduct.variants.length === 0 && productData.images?.length > 0) {
          transformedProduct.variants = productData.images.slice(0, 4).map((img: string, index: number) => ({
            id: String(index + 1),
            name: `Style ${index + 1}`,
            color: '#6B7280',
            imageUrl: img,
            thumbnail: img,
          }));
        }

        setProduct(transformedProduct);
        setSelectedVariant(transformedProduct.variants?.[0]);
      } catch (err) {
        setError({ type: 'network', message: 'Failed to load product details' });
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Load clothing image when variant changes
  useEffect(() => {
    const loadClothingImage = async () => {
      const imageUrl = selectedVariant?.imageUrl || product.imageUrl;
      if (!imageUrl) return;

      setClothingLoaded(false);

      try {
        const img = await ClothingOverlay.loadImage(imageUrl);
        clothingImageRef.current = img;

        // Determine clothing type from category
        let clothingType: ClothingType = 'shirt';
        const category = product.category?.toLowerCase() || '';
        if (category.includes('pant') || category.includes('trouser')) clothingType = 'pants';
        else if (category.includes('dress')) clothingType = 'dress';
        else if (category.includes('jacket') || category.includes('coat')) clothingType = 'jacket';
        else if (category.includes('skirt')) clothingType = 'skirt';
        else if (category.includes('short')) clothingType = 'shorts';

        setClothingItem({
          id: selectedVariant?.id || product.id,
          type: clothingType,
          imageUrl: imageUrl,
          image: img,
          anchorPoints: { top: 0, left: 0, right: 1, bottom: 1 },
        });

        setClothingLoaded(true);
      } catch (err) {
        setClothingLoaded(false);
      }
    };

    loadClothingImage();
  }, [selectedVariant, product]);

  // Initialize camera and pose detection
  useEffect(() => {
    const init = async () => {
      setStatus('initializing');
      setError(null);

      try {
        await startCamera();
      } catch (err: any) {
        setError({ type: 'camera', message: err.message || 'Failed to access camera' });
        setStatus('error');
      }
    };

    init();

    return () => {
      stopCamera();
      stopDetection();
    };
  }, []);

  // Start pose detection when camera is ready
  useEffect(() => {
    if (isCameraActive && videoRef.current && !isDetecting) {
      setStatus('ready');
      startDetection(videoRef.current);
    }
  }, [isCameraActive, videoRef.current]);

  // Handle camera error
  useEffect(() => {
    if (cameraError) {
      setError({ type: 'camera', message: cameraError.message });
      setStatus('error');
    }
  }, [cameraError]);

  // Handle model error
  useEffect(() => {
    if (modelError) {
      setError({ type: 'model', message: modelError.message });
    }
  }, [modelError]);

  // Render overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !pose || !clothingItem?.image) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Match canvas to video dimensions
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert pose keypoints to the format expected by ClothingOverlay
    const convertedPose: Pose = {
      keypoints: pose.keypoints.map((kp, index) => ({
        x: kp.x,
        y: kp.y,
        score: kp.score,
        name: kp.name,
      })),
      score: pose.score,
    };

    // Render clothing overlay
    ClothingOverlay.render({
      canvasCtx: ctx,
      pose: convertedPose,
      clothingImage: clothingItem,
      clothingType: clothingItem.type,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      scale: productSize / 100,
      opacity: 0.9,
    });

    // Render skeleton for debugging if enabled
    if (showSkeleton) {
      renderSkeleton(ctx, convertedPose, canvas.width, canvas.height);
    }
  }, [pose, clothingItem, productSize, showSkeleton]);

  // Render pose skeleton for debugging
  const renderSkeleton = (ctx: CanvasRenderingContext2D, pose: Pose, width: number, height: number) => {
    const keypoints = pose.keypoints;
    const minConfidence = 0.3;

    // Draw keypoints
    keypoints.forEach((kp) => {
      if ((kp.score || 0) > minConfidence) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fill();
      }
    });

    // Draw connections
    const connections = [
      [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
      [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
      [PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
      [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
      [PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
      [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP],
      [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_HIP],
      [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
      [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
      [PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
      [PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
      [PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
    ];

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;

    connections.forEach(([startIdx, endIdx]) => {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];

      if (start && end && (start.score || 0) > minConfidence && (end.score || 0) > minConfidence) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });
  };

  // Handle camera flip
  const handleCameraFlip = async () => {
    stopDetection();
    await toggleCamera();
    // Detection will restart via the useEffect when camera becomes active
  };

  // Handle photo capture
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const captureCanvas = document.createElement('canvas');
    const video = videoRef.current;
    const overlayCanvas = canvasRef.current;

    captureCanvas.width = video.videoWidth || video.clientWidth;
    captureCanvas.height = video.videoHeight || video.clientHeight;

    const ctx = captureCanvas.getContext('2d');
    if (ctx) {
      // If using front camera, flip the canvas to match the mirrored display
      if (isMirrored) {
        ctx.translate(captureCanvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0);
      // Draw overlay
      ctx.drawImage(overlayCanvas, 0, 0);

      // Download the image
      const dataUrl = captureCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ar-tryon-${Date.now()}.png`;
      link.click();
    }

    setTimeout(() => setIsCapturing(false), 500);
  };

  // Handle size adjustment
  const handleSizeChange = (size: number) => {
    setProductSize(size);
  };

  // Handle reset
  const handleReset = () => {
    setProductSize(100);
    setSelectedVariant(product.variants?.[0]);
  };

  // Handle share
  const handleShare = async () => {
    handleCapture();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AR Try-On',
          text: `Check out how I look in ${product.name}!`,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Toggle skeleton visibility
  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
  };

  const isInitializing = status === 'initializing' || isCameraLoading || isModelLoading;

  return (
    <div
      className={`relative bg-black ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full min-h-screen'
      }`}
    >
      {/* Camera Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
      />

      {/* AR Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10, transform: isMirrored ? 'scaleX(-1)' : 'none' }}
      />

      {/* Loading State */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20"
          >
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-white text-lg font-medium">
              {isCameraLoading ? t('ar.initializingCamera') : isModelLoading ? t('ar.loadingAIModel') : t('ar.settingUpAR')}
            </p>
            <p className="text-white/60 text-sm mt-2">
              {isCameraLoading ? t('ar.allowCameraAccess') : t('ar.mayTakeMoment')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6 z-20"
          >
            <div className="glass-solid rounded-2xl p-8 max-w-md text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">
                {error.type === 'camera'
                  ? 'Camera Access Required'
                  : error.type === 'browser'
                  ? 'Browser Not Supported'
                  : error.type === 'model'
                  ? 'AI Model Error'
                  : 'Something Went Wrong'}
              </h3>
              <p className="text-white/70 mb-6">{error.message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Retry
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 glass-solid text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && status === 'ready' && (
          <ARInstructions
            onDismiss={() => {
              setShowInstructions(false);
              localStorage.setItem('ar-instructions-shown', 'true');
            }}
          />
        )}
      </AnimatePresence>

      {/* Capture Flash Effect */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white pointer-events-none z-30"
          />
        )}
      </AnimatePresence>

      {/* Pose Detection Status */}
      {status === 'ready' && (
        <div className="absolute top-4 right-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass-solid text-xs font-medium ${
            pose ? 'text-green-400' : 'text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${pose ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            {pose ? t('ar.bodyDetected') : t('ar.lookingForBody')}
          </div>
        </div>
      )}

      {/* Ready State - Show Controls */}
      {status === 'ready' && (
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">Live</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSkeleton}
                  className="p-2 glass-solid rounded-lg hover:bg-white/20 transition-all"
                  title={showSkeleton ? 'Hide skeleton' : 'Show skeleton'}
                >
                  {showSkeleton ? (
                    <EyeOff className="w-5 h-5 text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 glass-solid rounded-lg hover:bg-white/20 transition-all"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Product Selector - Top */}
          <div className="absolute top-20 left-0 right-0 px-4 z-10">
            <ARProductSelector
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
          </div>

          {/* Controls - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
            <ARControls
              onCameraFlip={handleCameraFlip}
              onCapture={handleCapture}
              onSizeChange={handleSizeChange}
              onReset={handleReset}
              onClose={onClose}
              onShare={handleShare}
              isCapturing={isCapturing}
              currentSize={productSize}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ARTryOnView;
