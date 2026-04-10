# AR Try-On Hooks - Quick Reference

## Quick Start

```typescript
import { useCamera, usePoseDetection, useBodySegmentation } from '@/features/ar-tryon/hooks';

// 1. Initialize hooks
const camera = useCamera();
const pose = usePoseDetection({ modelType: 'full' });
const segmentation = useBodySegmentation();

// 2. Start AR session
const startAR = async () => {
  await camera.startCamera();
  if (camera.videoRef.current) {
    await pose.startDetection(camera.videoRef.current);
    await segmentation.startSegmentation(camera.videoRef.current);
  }
};

// 3. Stop AR session
const stopAR = () => {
  pose.stopDetection();
  segmentation.stopSegmentation();
  camera.stopCamera();
};
```

---

## useCamera

### Basic Usage
```typescript
const {
  videoRef,       // Attach to <video> element
  startCamera,    // Start camera stream
  stopCamera,     // Stop camera stream
  toggleCamera,   // Switch front/back camera
  isActive,       // Is camera streaming
  isLoading,      // Is camera initializing
  error           // Camera error
} = useCamera();
```

### Example
```tsx
<video ref={videoRef} autoPlay playsInline muted />
<button onClick={startCamera}>Start</button>
<button onClick={toggleCamera}>Switch</button>
```

---

## usePoseDetection

### Basic Usage
```typescript
const {
  pose,              // Detected pose with keypoints
  startDetection,    // Start detection
  stopDetection,     // Stop detection
  isDetecting,       // Is currently detecting
  isModelLoading,    // Is model loading
  modelError         // Model error
} = usePoseDetection({
  modelType: 'full',     // 'lite' | 'full' | 'heavy'
  minPoseScore: 0.25     // Min confidence threshold
});
```

### Access Keypoints
```typescript
if (pose) {
  // Get specific body part
  const leftShoulder = pose.keypoints.find(
    kp => kp.name === BodyPart.LEFT_SHOULDER
  );

  // Body measurements
  console.log(pose.measurements?.shoulderWidth);
  console.log(pose.measurements?.torsoLength);
}
```

### Draw Skeleton
```typescript
pose.keypoints.forEach(kp => {
  if (kp.score && kp.score > 0.3) {
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
});
```

---

## useBodySegmentation

### Basic Usage
```typescript
const {
  segmentation,        // Segmentation result
  segmentationMask,    // Binary mask (person vs background)
  startSegmentation,   // Start segmentation
  stopSegmentation,    // Stop segmentation
  isSegmenting,        // Is currently segmenting
  isLoading,           // Is model loading
  error                // Error
} = useBodySegmentation({
  modelType: 'general',       // 'general' | 'landscape'
  segmentationThreshold: 0.7  // Threshold (0-1)
});
```

### Use Mask
```typescript
if (segmentationMask) {
  const { data, width, height } = segmentationMask;
  // data[i] = 255 (person) or 0 (background)
  // Process mask...
}
```

---

## Common Patterns

### Full AR Session
```typescript
const ARSession = () => {
  const camera = useCamera();
  const pose = usePoseDetection();

  const start = async () => {
    await camera.startCamera();
    if (camera.videoRef.current) {
      await pose.startDetection(camera.videoRef.current);
    }
  };

  const stop = () => {
    pose.stopDetection();
    camera.stopCamera();
  };

  return (
    <>
      <video ref={camera.videoRef} />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      {pose.pose && <PoseOverlay pose={pose.pose} />}
    </>
  );
};
```

### Position Garment on Body
```typescript
if (pose) {
  const leftShoulder = pose.keypoints.find(k => k.name === BodyPart.LEFT_SHOULDER);
  const rightShoulder = pose.keypoints.find(k => k.name === BodyPart.RIGHT_SHOULDER);

  if (leftShoulder && rightShoulder) {
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    const width = Math.abs(rightShoulder.x - leftShoulder.x);

    // Position garment at (centerX, centerY) with width
  }
}
```

### Error Handling
```typescript
if (camera.error) {
  switch (camera.error.type) {
    case CameraErrorType.PERMISSION_DENIED:
      return <div>Please grant camera access</div>;
    case CameraErrorType.NOT_FOUND:
      return <div>No camera found</div>;
    default:
      return <div>Camera error: {camera.error.message}</div>;
  }
}
```

---

## Performance Tips

1. **Choose right model type**
   - Development: `modelType: 'lite'`
   - Production: `modelType: 'full'`

2. **Lower video resolution**
   ```typescript
   // Camera uses 720p by default
   // For lower-end devices, consider 640x480
   ```

3. **Only use what you need**
   ```typescript
   // If you don't need segmentation, don't start it
   const pose = usePoseDetection();
   // const segmentation = useBodySegmentation(); // Skip if not needed
   ```

4. **Throttle updates**
   ```typescript
   // Detection runs at video frame rate (~30fps)
   // You can throttle your UI updates
   useEffect(() => {
     if (pose) {
       // Update UI every 100ms instead of every frame
       const interval = setInterval(() => {
         updateUI(pose);
       }, 100);
       return () => clearInterval(interval);
     }
   }, [pose]);
   ```

---

## Troubleshooting

### Camera not starting
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Check console for errors

### Pose not detected
- Ensure good lighting
- Stand facing camera
- Ensure full body is visible
- Check `pose.score` (should be > 0.25)

### Low FPS
- Use `modelType: 'lite'`
- Lower video resolution
- Check if WebGL is enabled: `tf.getBackend()`

---

## Body Parts Reference

```typescript
enum BodyPart {
  NOSE,
  LEFT_EYE, RIGHT_EYE,
  LEFT_EAR, RIGHT_EAR,
  LEFT_SHOULDER, RIGHT_SHOULDER,  // Use for tops
  LEFT_ELBOW, RIGHT_ELBOW,
  LEFT_WRIST, RIGHT_WRIST,
  LEFT_HIP, RIGHT_HIP,            // Use for bottoms
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE
}
```

---

## Next Steps

1. See `README.md` for full documentation
2. See `USAGE_EXAMPLE.tsx` for complete example
3. See `../types/ar-types.ts` for all type definitions
