// AR Try-On Configuration Constants

export const AR_CONFIG = {
  // Camera settings
  camera: {
    defaultFacingMode: 'user' as const, // 'user' for front, 'environment' for back
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },

  // Pose detection settings
  poseDetection: {
    modelType: 'full' as const, // 'lite', 'full', 'heavy'
    enableSmoothing: true,
    smoothingFactor: 0.7, // 0-1, higher = more smoothing
    minPoseConfidence: 0.5,
    minPartConfidence: 0.3,
  },

  // Body segmentation settings
  segmentation: {
    flipHorizontal: false,
    internalResolution: 'medium' as const, // 'low', 'medium', 'high', 'full'
    segmentationThreshold: 0.7,
  },

  // Clothing overlay settings
  clothing: {
    // Offset percentages for positioning
    shirtOffsetY: -0.1, // Percentage of torso height
    pantsOffsetY: 0.05,
    dressOffsetY: -0.15,

    // Scale factors
    defaultScale: 1.0,
    minScale: 0.5,
    maxScale: 1.5,

    // Smoothing for position updates
    positionSmoothing: 0.8,
    scaleSmoothing: 0.9,
  },

  // Canvas settings
  canvas: {
    lineWidth: 2,
    keypointRadius: 4,
    skeletonColor: '#00ff00',
    keypointColor: '#ff0000',
  },

  // Performance settings
  performance: {
    targetFPS: 30,
    skipFrames: 1, // Process every Nth frame for performance
    enableWebGL: true,
  },
};

// Keypoint indices for MediaPipe Pose
export const POSE_KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

// Skeleton connections for visualization
export const SKELETON_CONNECTIONS = [
  // Face
  [POSE_KEYPOINTS.NOSE, POSE_KEYPOINTS.LEFT_EYE],
  [POSE_KEYPOINTS.NOSE, POSE_KEYPOINTS.RIGHT_EYE],
  [POSE_KEYPOINTS.LEFT_EYE, POSE_KEYPOINTS.LEFT_EAR],
  [POSE_KEYPOINTS.RIGHT_EYE, POSE_KEYPOINTS.RIGHT_EAR],

  // Torso
  [POSE_KEYPOINTS.LEFT_SHOULDER, POSE_KEYPOINTS.RIGHT_SHOULDER],
  [POSE_KEYPOINTS.LEFT_SHOULDER, POSE_KEYPOINTS.LEFT_HIP],
  [POSE_KEYPOINTS.RIGHT_SHOULDER, POSE_KEYPOINTS.RIGHT_HIP],
  [POSE_KEYPOINTS.LEFT_HIP, POSE_KEYPOINTS.RIGHT_HIP],

  // Left arm
  [POSE_KEYPOINTS.LEFT_SHOULDER, POSE_KEYPOINTS.LEFT_ELBOW],
  [POSE_KEYPOINTS.LEFT_ELBOW, POSE_KEYPOINTS.LEFT_WRIST],

  // Right arm
  [POSE_KEYPOINTS.RIGHT_SHOULDER, POSE_KEYPOINTS.RIGHT_ELBOW],
  [POSE_KEYPOINTS.RIGHT_ELBOW, POSE_KEYPOINTS.RIGHT_WRIST],

  // Left leg
  [POSE_KEYPOINTS.LEFT_HIP, POSE_KEYPOINTS.LEFT_KNEE],
  [POSE_KEYPOINTS.LEFT_KNEE, POSE_KEYPOINTS.LEFT_ANKLE],

  // Right leg
  [POSE_KEYPOINTS.RIGHT_HIP, POSE_KEYPOINTS.RIGHT_KNEE],
  [POSE_KEYPOINTS.RIGHT_KNEE, POSE_KEYPOINTS.RIGHT_ANKLE],
];

// Clothing type configurations
export const CLOTHING_TYPES = {
  SHIRT: {
    anchorPoints: ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_HIP', 'RIGHT_HIP'],
    offsetY: -0.1,
    scaleMultiplier: 1.2,
  },
  TSHIRT: {
    anchorPoints: ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_HIP', 'RIGHT_HIP'],
    offsetY: -0.05,
    scaleMultiplier: 1.15,
  },
  PANTS: {
    anchorPoints: ['LEFT_HIP', 'RIGHT_HIP', 'LEFT_ANKLE', 'RIGHT_ANKLE'],
    offsetY: 0.05,
    scaleMultiplier: 1.1,
  },
  DRESS: {
    anchorPoints: ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_KNEE', 'RIGHT_KNEE'],
    offsetY: -0.15,
    scaleMultiplier: 1.25,
  },
  JACKET: {
    anchorPoints: ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_HIP', 'RIGHT_HIP'],
    offsetY: -0.12,
    scaleMultiplier: 1.3,
  },
};

export type ClothingType = keyof typeof CLOTHING_TYPES;
