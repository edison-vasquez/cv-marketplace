// Exportaciones del módulo de inferencia

// Motor ONNX
export { ONNXInferenceEngine, getGlobalEngine, disposeGlobalEngine } from './onnx-engine';

// Motor TFJS
export { TFJSInferenceEngine, getGlobalTFJSEngine } from './tfjs-engine';

// Caché de modelos
export {
  modelCache,
  getCachedModel,
  setCachedModel,
  removeCachedModel,
  clearCache,
  getCacheStats,
  isModelCached,
  isCacheVersionValid,
} from './model-cache';

// Descargador de modelos
export {
  downloadWithProgress,
  downloadModelWithRetry,
  checkModelAvailability,
  formatBytes,
  estimateTimeRemaining,
  ModelDownloader,
} from './model-downloader';

// Preprocesamiento
export {
  preprocessImage,
  resizeImage,
  imageDataToTensor,
  elementToImageData,
  base64ToImageData,
} from './preprocessing';

// Postprocesamiento
export {
  parseYOLOv8Output,
  parseClassificationOutput,
  applyNMS,
  filterByConfidence,
  calculateIoU,
  denormalizeBBox,
} from './postprocessing';

// Tipos
export type {
  ModelMetadata,
  InputShape,
  OutputShape,
  PreprocessingConfig,
  PostprocessingConfig,
  Prediction,
  BoundingBox,
  InferenceResult,
  InferenceConfig,
  InferenceBackend,
  HardwareInfo,
} from './types';

export type { DownloadProgress, ProgressCallback } from './model-downloader';
