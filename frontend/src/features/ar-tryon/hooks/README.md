# AR Try-On Hooks

Camera integration and body pose detection hooks for the AR Try-On feature in fluxez-shop.

## Overview

This module provides three main hooks for building AR virtual try-on experiences:

1. **useCamera** - Webcam access and stream management
2. **usePoseDetection** - Real-time body pose detection using TensorFlow.js
3. **useBodySegmentation** - Person/background segmentation

## Dependencies

All required dependencies are already installed:

```json
{
  "@tensorflow/tfjs": "^4.x",
  "@tensorflow-models/body-segmentation": "^1.x",
  "@tensorflow-models/pose-detection": "^2.x",
  "@mediapipe/pose": "^0.5.x"
}
```

## Hooks Documentation

### 1. useCamera

Manages webcam access, permissions, and video stream.

#### Usage

```typescript
import { useCamera } from '@/features/ar-tryon/hooks';

const MyComponent = () => {
  const {
    videoRef,      // React ref for video element
    isLoading,     // Camera initialization status
    error,         // Camera error (if any)
    isActive,      // Is camera currently streaming
    facingMode,    // 'user' (front) or 'environment' (back)
    startCamera,   // Start camera stream
    stopCamera,    // Stop camera stream
    toggleCamera   // Toggle between front/back camera
  } = useCamera();

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <button onClick={startCamera} disabled={isActive}>
        Start Camera
      </button>
      <button onClick={stopCamera} disabled={!isActive}>
        Stop Camera
      </button>
      <button onClick={toggleCamera} disabled={!isActive}>
        Toggle Camera
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};
```

#### Features

- Automatic camera permission request
- Front/back camera toggle for mobile devices
- Graceful error handling with user-friendly messages
- Automatic cleanup on unmount
- 720p video at 30fps (ideal settings)

#### Error Types

```typescript
enum CameraErrorType {
  PERMISSION_DENIED,  // User denied camera access
  NOT_FOUND,          // No camera device found
  NOT_READABLE,       // Camera in use by another app
  OVERCONSTRAINED,    // Camera settings not supported
  UNKNOWN             // Other errors
}
```

---

### 2. usePoseDetection

Real-time body pose detection using TensorFlow.js MoveNet model.

#### Usage

```typescript
import { usePoseDetection } from '@/features/ar-tryon/hooks';

const MyComponent = () => {
  const {
    pose,              // Detected pose with keypoints
    isModelLoading,    // Model loading status
    modelError,        // Model error (if any)
    startDetection,    // Start pose detection
    stopDetection,     // Stop pose detection
    isDetecting        // Is currently detecting
  } = usePoseDetection({
    modelType: 'full',        // 'lite' | 'full' | 'heavy'
    enableSmoothing: true,    // Smooth keypoints over time
    minPoseScore: 0.25,       // Minimum confidence threshold
    minPartScore: 0.25,       // Minimum keypoint confidence
    flipHorizontal: false     // Mirror horizontally
  });

  const handleStart = async () => {
    const video = document.querySelector('video');
    if (video) {
      await startDetection(video);
    }
  };

  return (
    <div>
      {pose && (
        <div>
          <p>Keypoints: {pose.keypoints.length}</p>
          <p>Score: {((pose.score || 0) * 100).toFixed(1)}%</p>

          {/* Body measurements */}
          {pose.measurements && (
            <div>
              <p>Shoulder Width: {pose.measurements.shoulderWidth.toFixed(1)}px</p>
              <p>Torso Length: {pose.measurements.torsoLength.toFixed(1)}px</p>
              <p>Hip Width: {pose.measurements.hipWidth.toFixed(1)}px</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### Features

- Real-time pose detection at ~30fps
- 17 body keypoints (shoulders, hips, knees, etc.)
- Automatic body measurements calculation
- Confidence scores for each keypoint
- Temporal smoothing for stable tracking
- WebGL acceleration support

#### Body Parts Detected

```typescript
enum BodyPart {
  NOSE, LEFT_EYE, RIGHT_EYE,
  LEFT_EAR, RIGHT_EAR,
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_ELBOW, RIGHT_ELBOW,
  LEFT_WRIST, RIGHT_WRIST,
  LEFT_HIP, RIGHT_HIP,
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE
}
```

#### Pose Data Structure

```typescript
interface DetectedPose {
  keypoints: PoseKeypoint[];  // Array of body keypoints
  score: number;              // Overall pose confidence
  measurements?: {
    shoulderWidth: number;
    torsoLength: number;
    hipWidth: number;
    armLength: number;
    confidence: number;
  };
  timestamp: number;
}

interface PoseKeypoint {
  x: number;           // X coordinate
  y: number;           // Y coordinate
  score: number;       // Confidence (0-1)
  name: BodyPart;      // Body part name
}
```

---

### 3. useBodySegmentation

Person/background segmentation using MediaPipe Selfie Segmentation.

#### Usage

```typescript
import { useBodySegmentation } from '@/features/ar-tryon/hooks';

const MyComponent = () => {
  const {
    segmentation,        // Segmentation result
    segmentationMask,    // Binary mask (person vs background)
    isLoading,           // Model loading status
    error,               // Error (if any)
    startSegmentation,   // Start segmentation
    stopSegmentation,    // Stop segmentation
    isSegmenting         // Is currently segmenting
  } = useBodySegmentation({
    modelType: 'general',          // 'general' | 'landscape'
    enableSmoothing: true,         // Smooth mask over time
    flipHorizontal: false,         // Mirror horizontally
    segmentationThreshold: 0.7     // Threshold (0-1)
  });

  const handleStart = async () => {
    const video = document.querySelector('video');
    if (video) {
      await startSegmentation(video);
    }
  };

  return (
    <div>
      {segmentationMask && (
        <div>
          <p>Mask Size: {segmentationMask.width} x {segmentationMask.height}</p>
          <p>Data Length: {segmentationMask.data.length}</p>
        </div>
      )}
    </div>
  );
};
```

#### Features

- Real-time person/background separation
- Binary mask output (255 = person, 0 = background)
- Two model types: general (faster) and landscape (more accurate)
- Adjustable segmentation threshold
- Temporal smoothing for stable masks

#### Segmentation Mask Structure

```typescript
interface SegmentationMask {
  data: Uint8Array;  // Binary mask data (width * height * 4)
  width: number;     // Mask width
  height: number;    // Mask height
}
```

---

## Complete Example

See `USAGE_EXAMPLE.tsx` for a full working example that combines all three hooks.

### Basic Integration

```typescript
import { useCamera, usePoseDetection, useBodySegmentation } from '@/features/ar-tryon/hooks';

const ARTryOn = () => {
  const camera = useCamera();
  const pose = usePoseDetection({ modelType: 'full' });
  const segmentation = useBodySegmentation({ modelType: 'general' });

  const handleStart = async () => {
    // 1. Start camera
    await camera.startCamera();

    // 2. Start pose detection
    if (camera.videoRef.current) {
      await pose.startDetection(camera.videoRef.current);
      await segmentation.startSegmentation(camera.videoRef.current);
    }
  };

  const handleStop = () => {
    pose.stopDetection();
    segmentation.stopSegmentation();
    camera.stopCamera();
  };

  return (
    <div>
      <video ref={camera.videoRef} autoPlay playsInline muted />
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>

      {pose.pose && <p>Pose detected!</p>}
      {segmentation.segmentationMask && <p>Person segmented!</p>}
    </div>
  );
};
```

---

## Performance Considerations

### Model Types

**Pose Detection:**
- `lite` - Fastest, lower accuracy (30-60 fps)
- `full` - Balanced (20-30 fps) - **Recommended**
- `heavy` - Most accurate, slower (10-20 fps)

**Body Segmentation:**
- `general` - Faster, works well for most cases
- `landscape` - More accurate, better for full-body shots

### Optimization Tips

1. **Use appropriate model types** - Start with 'lite' models for testing
2. **Limit frame rate** - Detection at 15-30 fps is usually sufficient
3. **Lower video resolution** - 640x480 or 1280x720 works well
4. **Enable WebGL** - Hooks automatically use WebGL backend
5. **Only run what you need** - Don't run segmentation if not required

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Opera: Full support

**Requirements:**
- WebRTC support (for camera)
- WebGL support (for TensorFlow.js)
- Modern JavaScript (ES6+)

---

## Debugging

All hooks include console logging for debugging:

```typescript
// Camera logs
[useCamera] Starting camera...
[useCamera] Camera started successfully

// Pose detection logs
[usePoseDetection] Initializing TensorFlow.js...
[usePoseDetection] Model loaded successfully

// Segmentation logs
[useBodySegmentation] Starting body segmentation
[useBodySegmentation] Body segmentation started
```

Enable browser console to see detailed debug information.

---

## Error Handling

All hooks handle errors gracefully:

```typescript
const { error } = useCamera();

if (error) {
  switch (error.type) {
    case CameraErrorType.PERMISSION_DENIED:
      // Show permission instructions
      break;
    case CameraErrorType.NOT_FOUND:
      // Show "no camera" message
      break;
    // ... handle other errors
  }
}
```

---

## TypeScript Support

Full TypeScript support with comprehensive type definitions in `../types/ar-types.ts`.

Import types:

```typescript
import type {
  DetectedPose,
  PoseKeypoint,
  BodyPart,
  SegmentationMask,
  CameraError,
} from '@/features/ar-tryon/types';
```

---

## Next Steps

1. **Virtual Garment Overlay** - Use pose keypoints to position clothing
2. **Size Recommendation** - Use body measurements for size suggestions
3. **Background Replacement** - Use segmentation mask for custom backgrounds
4. **Snapshot Feature** - Capture images with overlays
5. **Social Sharing** - Share try-on images

---

## License

Part of the fluxez-shop project.

---

## Support

For issues or questions, please refer to the main project documentation.
