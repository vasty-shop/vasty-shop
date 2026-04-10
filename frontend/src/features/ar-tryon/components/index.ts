/**
 * AR Try-On UI Components
 * Export UI components for AR Try-On feature
 */

// New UI Components (working)
export { default as ARTryOnView } from './ARTryOnView';
export { default as ARControls } from './ARControls';
export { default as ARProductSelector } from './ARProductSelector';
export { default as ARInstructions } from './ARInstructions';
export { default as ARModal } from './ARModal';
export { default as ARButton } from './ARButton';

// Legacy AR Canvas Components (temporarily disabled - have type errors)
// Uncomment after fixing type errors in ar-types.ts
// export { ARCanvas } from './ARCanvas';
// export { ClothingOverlay } from './ClothingOverlay';
// export { PoseVisualization } from './PoseVisualization';
// export { ARTryOnExample } from './ARTryOnExample';
