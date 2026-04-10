/**
 * AR Try-On Type Definitions
 * Types for pose detection, body segmentation, and camera integration
 */

import type { Pose, Keypoint } from '@tensorflow-models/pose-detection';

// Re-export TensorFlow types for convenience
export type { Pose, Keypoint } from '@tensorflow-models/pose-detection';

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
  torsoHeight: number; // Alias for torsoLength for compatibility
  hipWidth: number;
  armLength: number;
  neckToWaist: number;
  waistToHip: number;
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

/**
 * Clothing position for overlay rendering
 */
export interface ClothingPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Clothing types supported
 */
export type ClothingType = 'shirt' | 'pants' | 'dress' | 'jacket' | 'skirt' | 'shorts';

/**
 * Clothing item for AR overlay
 */
export interface ClothingItem {
  id: string;
  type: ClothingType;
  imageUrl: string;
  image?: HTMLImageElement;
  anchorPoints: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

/**
 * Pose history for smoothing
 */
export interface PoseHistory {
  poses: Pose[];
  maxLength: number;
}

/**
 * MediaPipe pose landmark indices
 */
export enum PoseLandmark {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

/**
 * Skeleton connections for visualization
 */
export const POSE_CONNECTIONS: [PoseLandmark, PoseLandmark][] = [
  // Face
  [PoseLandmark.LEFT_EYE, PoseLandmark.RIGHT_EYE],
  [PoseLandmark.LEFT_EYE, PoseLandmark.NOSE],
  [PoseLandmark.RIGHT_EYE, PoseLandmark.NOSE],
  [PoseLandmark.LEFT_EYE, PoseLandmark.LEFT_EAR],
  [PoseLandmark.RIGHT_EYE, PoseLandmark.RIGHT_EAR],
  [PoseLandmark.MOUTH_LEFT, PoseLandmark.MOUTH_RIGHT],

  // Torso
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP],
  [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_HIP],
  [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],

  // Left arm
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
  [PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
  [PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_PINKY],
  [PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_INDEX],
  [PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_THUMB],

  // Right arm
  [PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
  [PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
  [PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_PINKY],
  [PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_INDEX],
  [PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_THUMB],

  // Left leg
  [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
  [PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
  [PoseLandmark.LEFT_ANKLE, PoseLandmark.LEFT_HEEL],
  [PoseLandmark.LEFT_ANKLE, PoseLandmark.LEFT_FOOT_INDEX],

  // Right leg
  [PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
  [PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
  [PoseLandmark.RIGHT_ANKLE, PoseLandmark.RIGHT_HEEL],
  [PoseLandmark.RIGHT_ANKLE, PoseLandmark.RIGHT_FOOT_INDEX],
];

/**
 * Confidence threshold for valid keypoints
 */
export const CONFIDENCE_THRESHOLD = 0.5;

/**
 * Default smoothing factor for pose stabilization (0-1, higher = more smoothing)
 */
export const DEFAULT_SMOOTHING_FACTOR = 0.7;
