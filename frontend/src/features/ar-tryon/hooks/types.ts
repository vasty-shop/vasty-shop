/**
 * AR Try-On Hooks - Type Definitions
 * Types for camera, pose detection, and body segmentation hooks
 */

import type { Pose, Keypoint } from '@tensorflow-models/pose-detection';

/**
 * Camera facing mode
 */
export type CameraFacingMode = 'user' | 'environment';

/**
 * Camera error types
 */
export enum CameraErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  NOT_READABLE = 'NOT_READABLE',
  OVERCONSTRAINED = 'OVERCONSTRAINED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Camera error interface
 */
export interface CameraError {
  type: CameraErrorType;
  message: string;
  originalError?: Error;
}

/**
 * Camera hook state
 */
export interface CameraState {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  error: CameraError | null;
  isActive: boolean;
  facingMode: CameraFacingMode;
}

/**
 * Camera hook return type
 */
export interface UseCameraReturn extends CameraState {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleCamera: () => Promise<void>;
}

/**
 * Body part names for pose keypoints
 */
export enum BodyPart {
  NOSE = 'nose',
  LEFT_EYE = 'left_eye',
  RIGHT_EYE = 'right_eye',
  LEFT_EAR = 'left_ear',
  RIGHT_EAR = 'right_ear',
  LEFT_SHOULDER = 'left_shoulder',
  RIGHT_SHOULDER = 'right_shoulder',
  LEFT_ELBOW = 'left_elbow',
  RIGHT_ELBOW = 'right_elbow',
  LEFT_WRIST = 'left_wrist',
  RIGHT_WRIST = 'right_wrist',
  LEFT_HIP = 'left_hip',
  RIGHT_HIP = 'right_hip',
  LEFT_KNEE = 'left_knee',
  RIGHT_KNEE = 'right_knee',
  LEFT_ANKLE = 'left_ankle',
  RIGHT_ANKLE = 'right_ankle',
}

/**
 * Enhanced pose keypoint with body part name
 */
export interface PoseKeypoint extends Keypoint {
  name: BodyPart;
}

/**
 * Body measurements calculated from pose
 */
export interface BodyMeasurements {
  shoulderWidth: number;
  torsoLength: number;
  hipWidth: number;
  armLength: number;
  confidence: number;
}

/**
 * Detected pose with enhanced information
 */
export interface DetectedPose extends Pose {
  keypoints: PoseKeypoint[];
  measurements?: BodyMeasurements;
  timestamp: number;
}

/**
 * Pose detection configuration
 */
export interface PoseDetectionConfig {
  modelType?: 'lite' | 'full' | 'heavy';
  enableSmoothing?: boolean;
  minPoseScore?: number;
  minPartScore?: number;
  maxPoses?: number;
  flipHorizontal?: boolean;
}

/**
 * Pose detection hook return type
 */
export interface UsePoseDetectionReturn {
  pose: DetectedPose | null;
  isModelLoading: boolean;
  modelError: Error | null;
  startDetection: (videoElement: HTMLVideoElement) => Promise<void>;
  stopDetection: () => void;
  isDetecting: boolean;
}

/**
 * Body segmentation mask
 */
export interface SegmentationMask {
  data: Uint8Array;
  width: number;
  height: number;
}

/**
 * Body segmentation result
 */
export interface BodySegmentation {
  width: number;
  height: number;
  maskData?: SegmentationMask;
  timestamp: number;
}

/**
 * Body segmentation configuration
 */
export interface BodySegmentationConfig {
  modelType?: 'general' | 'landscape';
  enableSmoothing?: boolean;
  flipHorizontal?: boolean;
  segmentationThreshold?: number;
}

/**
 * Body segmentation hook return type
 */
export interface UseBodySegmentationReturn {
  segmentation: BodySegmentation | null;
  segmentationMask: SegmentationMask | null;
  isLoading: boolean;
  error: Error | null;
  startSegmentation: (videoElement: HTMLVideoElement) => Promise<void>;
  stopSegmentation: () => void;
  isSegmenting: boolean;
}

/**
 * AR overlay configuration
 */
export interface AROverlayConfig {
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

/**
 * Virtual garment data
 */
export interface VirtualGarment {
  id: string;
  imageUrl: string;
  type: 'top' | 'bottom' | 'dress' | 'outerwear';
  anchorPoints: {
    shoulders?: { left: BodyPart; right: BodyPart };
    hips?: { left: BodyPart; right: BodyPart };
    waist?: { left: BodyPart; right: BodyPart };
  };
  defaultConfig: AROverlayConfig;
}

/**
 * AR Try-On session state
 */
export interface ARTryOnSession {
  isActive: boolean;
  garment: VirtualGarment | null;
  overlayConfig: AROverlayConfig;
  snapshots: string[];
  startTime: number | null;
  duration: number;
}
