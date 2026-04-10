/**
 * PoseVisualization Utility
 * Renders pose skeleton and keypoints on canvas for debugging
 */

import { Pose, PoseLandmark, POSE_CONNECTIONS } from '../types/ar-types';

interface PoseVisualizationRenderOptions {
  canvasCtx: CanvasRenderingContext2D;
  pose: Pose;
  showSkeleton?: boolean;
  showKeypoints?: boolean;
  canvasWidth: number;
  canvasHeight: number;
  lineColor?: string;
  keypointColor?: string;
  lineWidth?: number;
  keypointRadius?: number;
  minConfidence?: number;
}

/**
 * PoseVisualization static methods for rendering
 */
export const PoseVisualization = {
  /**
   * Render pose skeleton and keypoints on canvas
   */
  render(options: PoseVisualizationRenderOptions): void {
    const {
      canvasCtx,
      pose,
      showSkeleton = true,
      showKeypoints = true,
      lineColor = '#00ff00',
      keypointColor = '#ff0000',
      lineWidth = 2,
      keypointRadius = 4,
      minConfidence = 0.3,
    } = options;

    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return;
    }

    canvasCtx.save();

    // Draw skeleton connections
    if (showSkeleton) {
      canvasCtx.strokeStyle = lineColor;
      canvasCtx.lineWidth = lineWidth;
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';

      for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
        const startKeypoint = pose.keypoints[startIdx];
        const endKeypoint = pose.keypoints[endIdx];

        if (
          startKeypoint && endKeypoint &&
          (startKeypoint.score || 0) >= minConfidence &&
          (endKeypoint.score || 0) >= minConfidence
        ) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(startKeypoint.x, startKeypoint.y);
          canvasCtx.lineTo(endKeypoint.x, endKeypoint.y);
          canvasCtx.stroke();
        }
      }
    }

    // Draw keypoints
    if (showKeypoints) {
      for (const keypoint of pose.keypoints) {
        if ((keypoint.score || 0) >= minConfidence) {
          // Draw outer circle
          canvasCtx.beginPath();
          canvasCtx.arc(keypoint.x, keypoint.y, keypointRadius + 2, 0, 2 * Math.PI);
          canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          canvasCtx.fill();

          // Draw inner circle
          canvasCtx.beginPath();
          canvasCtx.arc(keypoint.x, keypoint.y, keypointRadius, 0, 2 * Math.PI);
          canvasCtx.fillStyle = keypointColor;
          canvasCtx.fill();

          // Draw confidence ring based on score
          const score = keypoint.score || 0;
          canvasCtx.beginPath();
          canvasCtx.arc(keypoint.x, keypoint.y, keypointRadius + 4, 0, 2 * Math.PI * score);
          canvasCtx.strokeStyle = `rgba(0, 255, 0, ${score})`;
          canvasCtx.lineWidth = 2;
          canvasCtx.stroke();
        }
      }
    }

    canvasCtx.restore();
  },

  /**
   * Render pose landmarks with labels (for debugging)
   */
  renderWithLabels(options: PoseVisualizationRenderOptions): void {
    const { canvasCtx, pose, minConfidence = 0.3 } = options;

    // First render standard visualization
    this.render(options);

    // Add labels for each keypoint
    canvasCtx.save();
    canvasCtx.font = '10px Arial';
    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.textAlign = 'center';

    const landmarkNames: Record<number, string> = {
      [PoseLandmark.NOSE]: 'Nose',
      [PoseLandmark.LEFT_EYE]: 'L Eye',
      [PoseLandmark.RIGHT_EYE]: 'R Eye',
      [PoseLandmark.LEFT_EAR]: 'L Ear',
      [PoseLandmark.RIGHT_EAR]: 'R Ear',
      [PoseLandmark.LEFT_SHOULDER]: 'L Shoulder',
      [PoseLandmark.RIGHT_SHOULDER]: 'R Shoulder',
      [PoseLandmark.LEFT_ELBOW]: 'L Elbow',
      [PoseLandmark.RIGHT_ELBOW]: 'R Elbow',
      [PoseLandmark.LEFT_WRIST]: 'L Wrist',
      [PoseLandmark.RIGHT_WRIST]: 'R Wrist',
      [PoseLandmark.LEFT_HIP]: 'L Hip',
      [PoseLandmark.RIGHT_HIP]: 'R Hip',
      [PoseLandmark.LEFT_KNEE]: 'L Knee',
      [PoseLandmark.RIGHT_KNEE]: 'R Knee',
      [PoseLandmark.LEFT_ANKLE]: 'L Ankle',
      [PoseLandmark.RIGHT_ANKLE]: 'R Ankle',
    };

    pose.keypoints.forEach((keypoint, index) => {
      if ((keypoint.score || 0) >= minConfidence && landmarkNames[index]) {
        // Draw background for text
        const text = landmarkNames[index];
        const textWidth = canvasCtx.measureText(text).width;
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        canvasCtx.fillRect(
          keypoint.x - textWidth / 2 - 2,
          keypoint.y - 20,
          textWidth + 4,
          14
        );

        // Draw text
        canvasCtx.fillStyle = '#ffffff';
        canvasCtx.fillText(text, keypoint.x, keypoint.y - 10);
      }
    });

    canvasCtx.restore();
  },

  /**
   * Get color based on confidence score
   */
  getConfidenceColor(score: number): string {
    if (score >= 0.8) return '#00ff00'; // Green - high confidence
    if (score >= 0.5) return '#ffff00'; // Yellow - medium confidence
    return '#ff0000'; // Red - low confidence
  },

  /**
   * Calculate body bounding box from pose
   */
  getBoundingBox(pose: Pose, minConfidence: number = 0.3): { x: number; y: number; width: number; height: number } | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let validPoints = 0;

    for (const keypoint of pose.keypoints) {
      if ((keypoint.score || 0) >= minConfidence) {
        minX = Math.min(minX, keypoint.x);
        minY = Math.min(minY, keypoint.y);
        maxX = Math.max(maxX, keypoint.x);
        maxY = Math.max(maxY, keypoint.y);
        validPoints++;
      }
    }

    if (validPoints < 3) {
      return null;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  },
};

export default PoseVisualization;
