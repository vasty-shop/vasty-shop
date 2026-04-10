/**
 * useBodySegmentation Hook
 * Manages body segmentation for person/background separation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import type {
  UseBodySegmentationReturn,
  BodySegmentation,
  SegmentationMask,
  BodySegmentationConfig,
} from './types';

/**
 * Default body segmentation configuration
 */
const DEFAULT_CONFIG: BodySegmentationConfig = {
  modelType: 'general',
  enableSmoothing: true,
  flipHorizontal: false,
  segmentationThreshold: 0.7,
};

/**
 * Custom hook for body segmentation
 */
export const useBodySegmentation = (
  config: BodySegmentationConfig = {}
): UseBodySegmentationReturn => {
  const [segmentation, setSegmentation] = useState<BodySegmentation | null>(null);
  const [segmentationMask, setSegmentationMask] = useState<SegmentationMask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSegmenting, setIsSegmenting] = useState(false);

  const segmenterRef = useRef<bodySegmentation.BodySegmenter | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Convert segmentation to binary mask
   */
  const createSegmentationMask = useCallback(
    async (
      segmentationResult: any[]
    ): Promise<SegmentationMask | null> => {
      try {
        if (segmentationResult.length === 0 || !videoElementRef.current) {
          return null;
        }

        // Get dimensions from video element
        const video = videoElementRef.current;
        const width = video.videoWidth || video.width || 640;
        const height = video.videoHeight || video.height || 480;

        // Get mask data
        const maskImageData = await bodySegmentation.toBinaryMask(
          segmentationResult,
          { r: 255, g: 255, b: 255, a: 255 }, // Foreground (person)
          { r: 0, g: 0, b: 0, a: 0 },          // Background
          false,
          mergedConfig.segmentationThreshold
        );

        // Convert ImageData to Uint8Array
        const maskData = new Uint8Array(maskImageData.data);

        return {
          data: maskData,
          width,
          height,
        };
      } catch (err) {
        console.error('[useBodySegmentation] Error creating mask:', err);
        return null;
      }
    },
    [mergedConfig.segmentationThreshold]
  );

  /**
   * Initialize TensorFlow.js and load body segmentation model
   */
  const initializeModel = useCallback(async () => {
    console.log('[useBodySegmentation] Initializing TensorFlow.js and model');
    setIsLoading(true);
    setError(null);

    try {
      // Set TensorFlow.js backend
      await tf.ready();
      console.log('[useBodySegmentation] TensorFlow.js backend:', tf.getBackend());

      // Try to use WebGL for better performance
      if (tf.getBackend() !== 'webgl') {
        try {
          await tf.setBackend('webgl');
          console.log('[useBodySegmentation] Switched to WebGL backend');
        } catch (err) {
          console.warn('[useBodySegmentation] Could not use WebGL, using:', tf.getBackend());
        }
      }

      // Create segmenter config
      const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: mergedConfig.modelType === 'landscape' ? 'landscape' : 'general',
      };

      console.log('[useBodySegmentation] Creating segmenter with config:', segmenterConfig);

      // Create body segmenter
      const segmenter = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        segmenterConfig
      );

      segmenterRef.current = segmenter;
      console.log('[useBodySegmentation] Model loaded successfully');
    } catch (err) {
      const loadError = err as Error;
      console.error('[useBodySegmentation] Error loading model:', loadError);
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, [mergedConfig.modelType]);

  /**
   * Segment body from video frame
   */
  const segmentBodyFrame = useCallback(async () => {
    if (
      !segmenterRef.current ||
      !videoElementRef.current ||
      !isSegmenting ||
      videoElementRef.current.readyState !== 4
    ) {
      return;
    }

    try {
      const video = videoElementRef.current;

      // Perform segmentation
      const segmentationResult = await segmenterRef.current.segmentPeople(video, {
        flipHorizontal: mergedConfig.flipHorizontal,
      });

      if (segmentationResult.length > 0) {
        // Create segmentation mask
        const mask = await createSegmentationMask(segmentationResult);

        // Get dimensions from video element
        const width = video.videoWidth || video.width || 640;
        const height = video.videoHeight || video.height || 480;

        // Create enhanced segmentation object
        const enhancedSegmentation: BodySegmentation = {
          width,
          height,
          maskData: mask || undefined,
          timestamp: Date.now(),
        };

        setSegmentation(enhancedSegmentation);
        setSegmentationMask(mask);
      } else {
        setSegmentation(null);
        setSegmentationMask(null);
      }
    } catch (err) {
      console.error('[useBodySegmentation] Error during segmentation:', err);
    }

    // Request next frame
    if (isSegmenting) {
      animationFrameRef.current = requestAnimationFrame(segmentBodyFrame);
    }
  }, [isSegmenting, mergedConfig.flipHorizontal, createSegmentationMask]);

  /**
   * Start body segmentation
   */
  const startSegmentation = useCallback(
    async (videoElement: HTMLVideoElement): Promise<void> => {
      console.log('[useBodySegmentation] Starting body segmentation');

      if (!segmenterRef.current) {
        await initializeModel();
      }

      if (!segmenterRef.current) {
        console.error('[useBodySegmentation] Segmenter not initialized');
        return;
      }

      videoElementRef.current = videoElement;
      setIsSegmenting(true);

      // Start segmentation loop
      animationFrameRef.current = requestAnimationFrame(segmentBodyFrame);
      console.log('[useBodySegmentation] Body segmentation started');
    },
    [initializeModel, segmentBodyFrame]
  );

  /**
   * Stop body segmentation
   */
  const stopSegmentation = useCallback((): void => {
    console.log('[useBodySegmentation] Stopping body segmentation');

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsSegmenting(false);
    setSegmentation(null);
    setSegmentationMask(null);
    videoElementRef.current = null;
    console.log('[useBodySegmentation] Body segmentation stopped');
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[useBodySegmentation] Cleaning up on unmount');
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (segmenterRef.current) {
        segmenterRef.current.dispose();
      }
    };
  }, []);

  /**
   * Continue segmentation loop when isSegmenting changes
   */
  useEffect(() => {
    if (isSegmenting) {
      segmentBodyFrame();
    }
  }, [isSegmenting, segmentBodyFrame]);

  return {
    segmentation,
    segmentationMask,
    isLoading,
    error,
    startSegmentation,
    stopSegmentation,
    isSegmenting,
  };
};
