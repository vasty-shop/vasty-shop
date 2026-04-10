/**
 * usePoseDetection Hook
 * Manages TensorFlow.js pose detection for body tracking
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type {
  UsePoseDetectionReturn,
  DetectedPose,
  PoseDetectionConfig,
  PoseKeypoint,
  BodyMeasurements,
} from './types';
import { BodyPart } from './types';

/**
 * Map pose detection keypoint names to BodyPart enum
 */
const KEYPOINT_NAME_MAP: Record<string, BodyPart> = {
  nose: BodyPart.NOSE,
  left_eye: BodyPart.LEFT_EYE,
  right_eye: BodyPart.RIGHT_EYE,
  left_ear: BodyPart.LEFT_EAR,
  right_ear: BodyPart.RIGHT_EAR,
  left_shoulder: BodyPart.LEFT_SHOULDER,
  right_shoulder: BodyPart.RIGHT_SHOULDER,
  left_elbow: BodyPart.LEFT_ELBOW,
  right_elbow: BodyPart.RIGHT_ELBOW,
  left_wrist: BodyPart.LEFT_WRIST,
  right_wrist: BodyPart.RIGHT_WRIST,
  left_hip: BodyPart.LEFT_HIP,
  right_hip: BodyPart.RIGHT_HIP,
  left_knee: BodyPart.LEFT_KNEE,
  right_knee: BodyPart.RIGHT_KNEE,
  left_ankle: BodyPart.LEFT_ANKLE,
  right_ankle: BodyPart.RIGHT_ANKLE,
};

/**
 * Default pose detection configuration
 */
const DEFAULT_CONFIG: PoseDetectionConfig = {
  modelType: 'full',
  enableSmoothing: true,
  minPoseScore: 0.25,
  minPartScore: 0.25,
  maxPoses: 1,
  flipHorizontal: false,
};

/**
 * Custom hook for pose detection
 */
export const usePoseDetection = (
  config: PoseDetectionConfig = {}
): UsePoseDetectionReturn => {
  const [pose, setPose] = useState<DetectedPose | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<Error | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Calculate Euclidean distance between two points
   */
  const calculateDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  /**
   * Calculate body measurements from pose keypoints
   */
  const calculateBodyMeasurements = (
    keypoints: PoseKeypoint[]
  ): BodyMeasurements | undefined => {
    try {
      const getKeypoint = (name: BodyPart) =>
        keypoints.find(kp => kp.name === name);

      const leftShoulder = getKeypoint(BodyPart.LEFT_SHOULDER);
      const rightShoulder = getKeypoint(BodyPart.RIGHT_SHOULDER);
      const leftHip = getKeypoint(BodyPart.LEFT_HIP);
      const rightHip = getKeypoint(BodyPart.RIGHT_HIP);
      const leftElbow = getKeypoint(BodyPart.LEFT_ELBOW);
      const leftWrist = getKeypoint(BodyPart.LEFT_WRIST);

      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return undefined;
      }

      // Calculate measurements
      const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
      const hipWidth = calculateDistance(leftHip, rightHip);
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
      const hipMidpoint = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };
      const torsoLength = calculateDistance(shoulderMidpoint, hipMidpoint);

      // Calculate arm length if available
      let armLength = 0;
      if (leftShoulder && leftElbow && leftWrist) {
        const upperArm = calculateDistance(leftShoulder, leftElbow);
        const forearm = calculateDistance(leftElbow, leftWrist);
        armLength = upperArm + forearm;
      }

      // Average confidence of key body parts
      const confidence =
        (leftShoulder.score! +
          rightShoulder.score! +
          leftHip.score! +
          rightHip.score!) /
        4;

      return {
        shoulderWidth,
        torsoLength,
        hipWidth,
        armLength,
        confidence,
      };
    } catch (err) {
      console.error('[usePoseDetection] Error calculating measurements:', err);
      return undefined;
    }
  };

  /**
   * Initialize TensorFlow.js and load pose detection model
   */
  const initializeModel = useCallback(async () => {
    console.log('[usePoseDetection] Initializing TensorFlow.js and model');
    setIsModelLoading(true);
    setModelError(null);

    try {
      // Set TensorFlow.js backend
      await tf.ready();
      console.log('[usePoseDetection] TensorFlow.js backend:', tf.getBackend());

      // Try to use WebGL for better performance
      if (tf.getBackend() !== 'webgl') {
        try {
          await tf.setBackend('webgl');
          console.log('[usePoseDetection] Switched to WebGL backend');
        } catch (err) {
          console.warn('[usePoseDetection] Could not use WebGL, using:', tf.getBackend());
        }
      }

      // Create detector config based on model type
      const detectorConfig: poseDetection.MoveNetModelConfig = {
        modelType:
          mergedConfig.modelType === 'lite'
            ? poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            : mergedConfig.modelType === 'heavy'
            ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
            : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: mergedConfig.enableSmoothing,
        minPoseScore: mergedConfig.minPoseScore,
      };

      console.log('[usePoseDetection] Creating detector with config:', detectorConfig);

      // Create pose detector
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      detectorRef.current = detector;
      console.log('[usePoseDetection] Model loaded successfully');
    } catch (err) {
      const error = err as Error;
      console.error('[usePoseDetection] Error loading model:', error);
      setModelError(error);
    } finally {
      setIsModelLoading(false);
    }
  }, [mergedConfig]);

  /**
   * Detect pose from video frame
   */
  const detectPoseFrame = useCallback(async () => {
    if (
      !detectorRef.current ||
      !videoElementRef.current ||
      !isDetecting ||
      videoElementRef.current.readyState !== 4
    ) {
      return;
    }

    try {
      const video = videoElementRef.current;

      // Estimate poses
      const poses = await detectorRef.current.estimatePoses(video, {
        flipHorizontal: mergedConfig.flipHorizontal,
      });

      if (poses.length > 0) {
        const detectedPose = poses[0];

        // Map keypoints to our enhanced format
        const enhancedKeypoints: PoseKeypoint[] = detectedPose.keypoints.map(kp => ({
          ...kp,
          name: KEYPOINT_NAME_MAP[kp.name!] || (kp.name as BodyPart),
        }));

        // Calculate body measurements
        const measurements = calculateBodyMeasurements(enhancedKeypoints);

        // Create enhanced pose object
        const enhancedPose: DetectedPose = {
          ...detectedPose,
          keypoints: enhancedKeypoints,
          measurements,
          timestamp: Date.now(),
        };

        setPose(enhancedPose);
      } else {
        setPose(null);
      }
    } catch (err) {
      console.error('[usePoseDetection] Error during pose detection:', err);
    }

    // Request next frame
    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(detectPoseFrame);
    }
  }, [isDetecting, mergedConfig.flipHorizontal]);

  /**
   * Start pose detection
   */
  const startDetection = useCallback(
    async (videoElement: HTMLVideoElement): Promise<void> => {
      console.log('[usePoseDetection] Starting pose detection');

      if (!detectorRef.current) {
        await initializeModel();
      }

      if (!detectorRef.current) {
        console.error('[usePoseDetection] Detector not initialized');
        return;
      }

      videoElementRef.current = videoElement;
      setIsDetecting(true);

      // Start detection loop
      animationFrameRef.current = requestAnimationFrame(detectPoseFrame);
      console.log('[usePoseDetection] Pose detection started');
    },
    [initializeModel, detectPoseFrame]
  );

  /**
   * Stop pose detection
   */
  const stopDetection = useCallback((): void => {
    console.log('[usePoseDetection] Stopping pose detection');

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsDetecting(false);
    setPose(null);
    videoElementRef.current = null;
    console.log('[usePoseDetection] Pose detection stopped');
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[usePoseDetection] Cleaning up on unmount');
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  /**
   * Continue detection loop when isDetecting changes
   */
  useEffect(() => {
    if (isDetecting) {
      detectPoseFrame();
    }
  }, [isDetecting, detectPoseFrame]);

  return {
    pose,
    isModelLoading,
    modelError,
    startDetection,
    stopDetection,
    isDetecting,
  };
};
