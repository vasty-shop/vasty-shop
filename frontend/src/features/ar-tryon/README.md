# AR Try-On Components

Complete AR overlay system for virtual clothing try-on using pose estimation.

## Overview

This module provides components and utilities for rendering clothing overlays on live camera feeds based on real-time pose detection. It's designed to work with MediaPipe Pose or similar pose estimation libraries.

## Components

### 1. ARCanvas

Main canvas component that orchestrates the AR overlay rendering.

**Props:**
- `videoRef`: Reference to video element with camera feed
- `width`: Canvas width (should match video width)
- `height`: Canvas height (should match video height)
- `pose`: Current pose data from pose detector
- `clothingImage`: Clothing item to overlay
- `showSkeleton`: Show debug skeleton visualization (default: false)
- `smoothingFactor`: Smoothing factor for pose data (0-1, default: 0.7)

**Example:**
```tsx
import { ARCanvas } from '@/features/ar-tryon/components';

<ARCanvas
  videoRef={videoRef}
  width={1280}
  height={720}
  pose={currentPose}
  clothingImage={clothingItem}
  showSkeleton={false}
/>
```

### 2. ClothingOverlay

Handles positioning and rendering of clothing based on detected pose.

**Supported Clothing Types:**
- `shirt` - Standard shirt/t-shirt
- `jacket` - Jacket/outerwear
- `pants` - Full-length pants
- `shorts` - Short pants
- `dress` - Full dress
- `skirt` - Skirt

**Usage:**
```tsx
import { ClothingOverlay } from '@/features/ar-tryon/components';

ClothingOverlay.render({
  canvasCtx: ctx,
  pose: currentPose,
  clothingImage: item,
  clothingType: 'shirt',
  canvasWidth: 1280,
  canvasHeight: 720,
});
```

### 3. PoseVisualization

Debug visualization for pose detection.

**Features:**
- Draw skeleton connections
- Show keypoint confidence
- Display bounding box
- Label body parts
- Confidence indicator

**Usage:**
```tsx
import { PoseVisualization } from '@/features/ar-tryon/components';

PoseVisualization.render({
  canvasCtx: ctx,
  pose: currentPose,
  showSkeleton: true,
});
```

## Utilities

### poseUtils.ts

**Key Functions:**
- `calculateBodyMeasurements(pose)` - Get shoulder width, torso height, etc.
- `calculateClothingPosition(pose, type, width, height)` - Calculate clothing overlay position
- `calculateTorsoRotation(pose)` - Get body rotation angle
- `isValidKeypoint(keypoint)` - Check if keypoint is valid
- `PoseSmoothing` - Class for smoothing pose data over time

**Example:**
```typescript
import { calculateBodyMeasurements, PoseSmoothing } from '@/features/ar-tryon/utils';

// Calculate measurements
const measurements = calculateBodyMeasurements(pose);
console.log(measurements.shoulderWidth);

// Smooth pose data
const smoother = new PoseSmoothing(0.7, 5);
const smoothedPose = smoother.smooth(newPose);
```

### imageUtils.ts

**Key Functions:**
- `loadImage(url)` - Load and cache image
- `preloadImages(urls)` - Load multiple images
- `drawTransformedImage(ctx, image, x, y, w, h, rotation, opacity)` - Draw with transforms
- `drawPerspectiveImage(ctx, image, corners, opacity)` - Draw with perspective
- `createClothingItem(id, type, url)` - Create clothing item object

**Example:**
```typescript
import { loadImage, createClothingItem } from '@/features/ar-tryon/utils';

// Load image
const image = await loadImage('/clothing/shirt.png');

// Create clothing item
const item = await createClothingItem('shirt_1', 'shirt', '/clothing/shirt.png');
```

## Types

### Pose
```typescript
interface Pose {
  keypoints: Keypoint[];
  confidence: number;
  timestamp?: number;
}
```

### Keypoint
```typescript
interface Keypoint {
  x: number;        // Normalized 0-1
  y: number;        // Normalized 0-1
  confidence: number;
  name?: string;
}
```

### ClothingItem
```typescript
interface ClothingItem {
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
```

## Integration Guide

### Step 1: Setup Camera

```tsx
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  const initCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' }
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };
  initCamera();
}, []);
```

### Step 2: Initialize Pose Detection

```tsx
// Install: npm install @mediapipe/pose
import { Pose } from '@mediapipe/pose';

const [currentPose, setCurrentPose] = useState<Pose | null>(null);

useEffect(() => {
  const poseDetector = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });
  
  poseDetector.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  poseDetector.onResults((results) => {
    if (results.poseLandmarks) {
      setCurrentPose({
        keypoints: results.poseLandmarks.map((lm, i) => ({
          x: lm.x,
          y: lm.y,
          confidence: lm.visibility || 0,
          name: `landmark_${i}`
        })),
        confidence: 0.9,
        timestamp: Date.now()
      });
    }
  });

  // Start detection loop
  const detectPose = async () => {
    if (videoRef.current) {
      await poseDetector.send({ image: videoRef.current });
    }
    requestAnimationFrame(detectPose);
  };
  detectPose();
}, []);
```

### Step 3: Load Clothing

```tsx
import { createClothingItem } from '@/features/ar-tryon/utils';

const [clothingItem, setClothingItem] = useState<ClothingItem | null>(null);

useEffect(() => {
  const loadClothing = async () => {
    const item = await createClothingItem(
      'product_123',
      'shirt',
      'https://example.com/shirt.png'
    );
    setClothingItem(item);
  };
  loadClothing();
}, []);
```

### Step 4: Render AR Overlay

```tsx
return (
  <div className="relative w-full h-screen">
    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
    
    <ARCanvas
      videoRef={videoRef}
      width={1280}
      height={720}
      pose={currentPose}
      clothingImage={clothingItem}
      showSkeleton={false}
      smoothingFactor={0.7}
    />
  </div>
);
```

## Performance Tips

1. **Image Caching**: Images are automatically cached after first load
2. **Pose Smoothing**: Use smoothing to reduce jitter (0.7 recommended)
3. **Canvas Size**: Match canvas size to video dimensions for best performance
4. **RequestAnimationFrame**: Rendering uses RAF for smooth 60fps
5. **Low Confidence Handling**: Keypoints below confidence threshold are ignored

## Edge Cases Handled

- Missing keypoints (partial body detection)
- Low confidence keypoints (filtered out)
- Camera aspect ratio changes
- Image loading failures
- Pose tracking loss
- Multiple clothing types
- Body rotation and perspective

## Debug Mode

Enable skeleton visualization for debugging:

```tsx
<ARCanvas
  {...props}
  showSkeleton={true}  // Shows pose skeleton overlay
/>
```

Additional debug visualizations:
```tsx
import { PoseVisualization } from '@/features/ar-tryon/components';

// Show labels
PoseVisualization.drawLabels(ctx, pose, width, height);

// Highlight specific body parts
PoseVisualization.highlightBodyParts(
  ctx, 
  pose, 
  [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
  width,
  height
);

// Draw bounding box
PoseVisualization.drawBoundingBox(ctx, pose, width, height);
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

Requires:
- WebRTC (camera access)
- Canvas 2D API
- ES6+ support

## License

Copyright 2024 - Fluxez Shop
