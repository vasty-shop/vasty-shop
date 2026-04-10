/**
 * AR Try-On Hooks - Index
 * Centralized exports for all AR Try-On hooks
 */

// Export hooks
export { useCamera } from './useCamera';
export { usePoseDetection } from './usePoseDetection';
export { useBodySegmentation } from './useBodySegmentation';

// Export types
export type {
  UseCameraReturn,
  UsePoseDetectionReturn,
  UseBodySegmentationReturn,
  CameraError,
  CameraErrorType,
  BodyPart,
  DetectedPose,
  PoseKeypoint,
  BodyMeasurements,
  SegmentationMask,
  BodySegmentation,
} from './types';

export * from './types';
