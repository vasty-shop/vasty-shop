/**
 * ClothingOverlay Utility
 * Renders clothing overlay on canvas based on pose detection
 */

import { Pose, ClothingItem, ClothingType, PoseLandmark } from '../types/ar-types';

interface ClothingOverlayRenderOptions {
  canvasCtx: CanvasRenderingContext2D;
  pose: Pose;
  clothingImage: ClothingItem;
  clothingType: ClothingType;
  canvasWidth: number;
  canvasHeight: number;
  scale?: number;
  opacity?: number;
}

interface ClothingPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Get keypoint by index from pose
 */
const getKeypoint = (pose: Pose, index: PoseLandmark) => {
  return pose.keypoints[index];
};

/**
 * Calculate distance between two points
 */
const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate angle between two points
 */
const angleBetween = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Calculate clothing position based on pose and clothing type
 */
const calculateClothingPosition = (
  pose: Pose,
  clothingType: ClothingType,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 1.0
): ClothingPosition | null => {
  const leftShoulder = getKeypoint(pose, PoseLandmark.LEFT_SHOULDER);
  const rightShoulder = getKeypoint(pose, PoseLandmark.RIGHT_SHOULDER);
  const leftHip = getKeypoint(pose, PoseLandmark.LEFT_HIP);
  const rightHip = getKeypoint(pose, PoseLandmark.RIGHT_HIP);
  const leftKnee = getKeypoint(pose, PoseLandmark.LEFT_KNEE);
  const rightKnee = getKeypoint(pose, PoseLandmark.RIGHT_KNEE);

  // Check if we have required keypoints with sufficient confidence
  const minConfidence = 0.3;

  if (clothingType === 'shirt' || clothingType === 'jacket') {
    if (
      !leftShoulder || !rightShoulder || !leftHip || !rightHip ||
      (leftShoulder.score || 0) < minConfidence ||
      (rightShoulder.score || 0) < minConfidence ||
      (leftHip.score || 0) < minConfidence ||
      (rightHip.score || 0) < minConfidence
    ) {
      return null;
    }

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const torsoHeight = distance(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
    );

    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    const rotation = angleBetween(leftShoulder, rightShoulder);

    return {
      x: centerX,
      y: centerY + torsoHeight * 0.1,
      width: shoulderWidth * 1.4 * scale,
      height: torsoHeight * 1.3 * scale,
      rotation,
    };
  }

  if (clothingType === 'pants' || clothingType === 'shorts' || clothingType === 'skirt') {
    if (
      !leftHip || !rightHip ||
      (leftHip.score || 0) < minConfidence ||
      (rightHip.score || 0) < minConfidence
    ) {
      return null;
    }

    const hipWidth = distance(leftHip, rightHip);
    let legLength = hipWidth * 1.5; // Default

    if (leftKnee && rightKnee &&
        (leftKnee.score || 0) >= minConfidence &&
        (rightKnee.score || 0) >= minConfidence) {
      legLength = distance(
        { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 },
        { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 }
      );

      if (clothingType === 'pants') {
        legLength *= 2; // Full length
      } else if (clothingType === 'shorts') {
        legLength *= 0.6; // Short length
      }
    }

    const centerX = (leftHip.x + rightHip.x) / 2;
    const centerY = (leftHip.y + rightHip.y) / 2;
    const rotation = angleBetween(leftHip, rightHip);

    return {
      x: centerX,
      y: centerY,
      width: hipWidth * 1.3 * scale,
      height: legLength * scale,
      rotation,
    };
  }

  if (clothingType === 'dress') {
    if (
      !leftShoulder || !rightShoulder || !leftHip || !rightHip ||
      (leftShoulder.score || 0) < minConfidence ||
      (rightShoulder.score || 0) < minConfidence
    ) {
      return null;
    }

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    let dressLength = shoulderWidth * 2; // Default

    if (leftKnee && rightKnee &&
        (leftKnee.score || 0) >= minConfidence &&
        (rightKnee.score || 0) >= minConfidence) {
      dressLength = distance(
        { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
        { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 }
      );
    }

    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    const rotation = angleBetween(leftShoulder, rightShoulder);

    return {
      x: centerX,
      y: centerY,
      width: shoulderWidth * 1.5 * scale,
      height: dressLength * 1.2 * scale,
      rotation,
    };
  }

  return null;
};

/**
 * ClothingOverlay static methods for rendering
 */
export const ClothingOverlay = {
  /**
   * Render clothing overlay on canvas
   */
  render(options: ClothingOverlayRenderOptions): void {
    const {
      canvasCtx,
      pose,
      clothingImage,
      clothingType,
      canvasWidth,
      canvasHeight,
      scale = 1.0,
      opacity = 0.9,
    } = options;

    // Calculate position based on pose
    const position = calculateClothingPosition(pose, clothingType, canvasWidth, canvasHeight, scale);

    if (!position || !clothingImage.image) {
      return;
    }

    canvasCtx.save();
    canvasCtx.globalAlpha = opacity;

    // Translate to center and rotate
    canvasCtx.translate(position.x, position.y);
    canvasCtx.rotate(position.rotation);

    // Draw the clothing image centered
    const drawX = -position.width / 2;
    const drawY = -position.height * 0.1; // Slight offset to align with shoulders

    try {
      canvasCtx.drawImage(
        clothingImage.image,
        drawX,
        drawY,
        position.width,
        position.height
      );
    } catch (error) {
      console.error('[ClothingOverlay] Error drawing image:', error);
    }

    canvasCtx.restore();
  },

  /**
   * Preload clothing image
   */
  async loadImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  },
};

export default ClothingOverlay;
