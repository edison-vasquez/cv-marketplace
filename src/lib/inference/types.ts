// Tipos para el sistema de inferencia local

export interface ModelMetadata {
  id: string;
  title: string;
  format: 'onnx' | 'tfjs' | 'both';
  onnxModelUrl?: string;
  tfjsModelUrl?: string;
  modelSizeBytes?: number;
  inputShape: InputShape;
  outputShape?: OutputShape;
  labels: string[];
  preprocessing: PreprocessingConfig;
  postprocessing: PostprocessingConfig;
  technical: 'Detection' | 'Classification' | 'Segmentation';
}

export interface InputShape {
  width: number;
  height: number;
  channels: number;
}

export interface OutputShape {
  type: 'detection' | 'classification' | 'segmentation';
  format: string;
}

export interface PreprocessingConfig {
  mean: number[];
  std: number[];
  normalize: boolean;
  channelOrder: 'RGB' | 'BGR';
}

export interface PostprocessingConfig {
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
}

export interface Prediction {
  class: string;
  classId: number;
  confidence: number;
  bbox?: BoundingBox;
  mask?: number[][];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InferenceResult {
  predictions: Prediction[];
  inferenceTimeMs: number;
  inputSize: { width: number; height: number };
}

export interface InferenceConfig {
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
  inputShape: InputShape;
  labels: string[];
  preprocessing: PreprocessingConfig;
}

export type InferenceBackend = 'webgpu' | 'webgl' | 'wasm' | 'cpu';

export interface HardwareInfo {
  backend: InferenceBackend;
  gpuName?: string;
  supportsWebGPU: boolean;
  supportsWebGL: boolean;
}
