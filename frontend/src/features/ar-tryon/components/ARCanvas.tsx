/**
 * AR Canvas Component
 * Main canvas overlay for rendering clothing and pose visualization
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Pose, ClothingItem } from '../types/ar-types';
import { ClothingOverlay } from './ClothingOverlay';
import { PoseVisualization } from './PoseVisualization';

interface ARCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  width: number;
  height: number;
  pose: Pose | null;
  clothingImage: ClothingItem | null;
  showSkeleton?: boolean;
  smoothingFactor?: number;
}

export const ARCanvas: React.FC<ARCanvasProps> = ({
  videoRef,
  width,
  height,
  pose,
  clothingImage,
  showSkeleton = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Main render loop
   */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Only render if we have a valid pose
    if (!pose || pose.keypoints.length === 0) {
      return;
    }

    try {
      // Render clothing overlay if available
      if (clothingImage && clothingImage.image) {
        ClothingOverlay.render({
          canvasCtx: ctx,
          pose,
          clothingImage,
          clothingType: clothingImage.type,
          canvasWidth: width,
          canvasHeight: height,
        });
      }

      // Render pose skeleton for debugging
      if (showSkeleton) {
        PoseVisualization.render({
          canvasCtx: ctx,
          pose,
          showSkeleton: true,
          canvasWidth: width,
          canvasHeight: height,
        });
      }
    } catch (error) {
      console.error('Error rendering AR frame:', error);
    }
  }, [width, height, pose, clothingImage, showSkeleton]);

  /**
   * Animation loop
   */
  useEffect(() => {
    const animate = () => {
      renderFrame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderFrame]);

  /**
   * Handle canvas resize
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Set canvas style for proper scaling
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, [width, height]);

  /**
   * Handle video resize
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Match canvas size to video
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (videoWidth > 0 && videoHeight > 0) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
    };

    video.addEventListener('loadedmetadata', handleResize);
    video.addEventListener('resize', handleResize);

    return () => {
      video.removeEventListener('loadedmetadata', handleResize);
      video.removeEventListener('resize', handleResize);
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        mixBlendMode: 'normal',
        zIndex: 10,
      }}
    />
  );
};

export default ARCanvas;
