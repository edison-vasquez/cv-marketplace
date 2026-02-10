// Motor de inferencia ONNX Runtime Web

import * as ort from 'onnxruntime-web';
import {
  InferenceConfig,
  InferenceResult,
  Prediction,
  InferenceBackend,
  HardwareInfo,
} from './types';
import { preprocessImage } from './preprocessing';
import {
  parseYOLOv8Output,
  parseClassificationOutput,
  parseYuNetOutput,
  parseTinyYOLOv2Output,
  parseSSDOutput,
  COCO_LABELS,
} from './postprocessing';

// Configurar paths de WASM usando CDN oficial de ONNX Runtime
if (typeof window !== 'undefined') {
  // Usar CDN de jsDelivr para los archivos WASM (debe coincidir con la versión instalada)
  const ortVersion = '1.24.1';
  ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortVersion}/dist/`;

  // Single-threaded mode (multi-threading requires Cross-Origin Isolation headers)
  ort.env.wasm.numThreads = 1;
}

// Tipos de modelo soportados
export type ModelFormat = 'yolov8' | 'yunet' | 'tinyyolov2' | 'ssd' | 'classification';

export class ONNXInferenceEngine {
  private session: ort.InferenceSession | null = null;
  private backend: InferenceBackend = 'wasm';
  private modelLoaded = false;
  private modelFormat: ModelFormat = 'classification';
  private modelUrl: string = '';

  /**
   * Detecta el mejor backend disponible
   */
  async detectBestBackend(): Promise<HardwareInfo> {
    let supportsWebGPU = false;
    let supportsWebGL = false;
    let gpuName: string | undefined;

    // Detectar WebGPU
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu?.requestAdapter();
        if (adapter) {
          supportsWebGPU = true;
          const info = await adapter.requestAdapterInfo?.();
          gpuName = info?.description || info?.device || 'WebGPU Device';
        }
      } catch {
        supportsWebGPU = false;
      }
    }

    // Detectar WebGL
    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          supportsWebGL = true;
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo && !gpuName) {
            gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch {
        supportsWebGL = false;
      }
    }

    // Elegir mejor backend
    let backend: InferenceBackend = 'wasm';
    if (supportsWebGPU) {
      backend = 'webgpu';
    } else if (supportsWebGL) {
      backend = 'webgl';
    }

    this.backend = backend;

    return {
      backend,
      gpuName,
      supportsWebGPU,
      supportsWebGL,
    };
  }

  /**
   * Detecta el formato del modelo basado en la URL
   */
  private detectModelFormat(url: string): ModelFormat {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('yunet') || lowerUrl.includes('face-detection')) {
      return 'yunet';
    }
    if (lowerUrl.includes('tiny-yolov2') || lowerUrl.includes('tinyyolo')) {
      return 'tinyyolov2';
    }
    if (lowerUrl.includes('ssd') || lowerUrl.includes('ssd-mobilenet')) {
      return 'ssd';
    }
    if (lowerUrl.includes('yolov8') || lowerUrl.includes('yolo')) {
      return 'yolov8';
    }
    // Classification models
    if (lowerUrl.includes('mobilenet') || lowerUrl.includes('efficientnet') ||
        lowerUrl.includes('resnet') || lowerUrl.includes('shufflenet') ||
        lowerUrl.includes('squeezenet') || lowerUrl.includes('alexnet')) {
      return 'classification';
    }

    return 'classification'; // default
  }

  /**
   * Inicializa el motor con un modelo
   */
  async initialize(
    modelSource: string | ArrayBuffer | Uint8Array,
    preferredBackend?: InferenceBackend
  ): Promise<void> {
    // Guardar URL para detectar formato
    if (typeof modelSource === 'string') {
      this.modelUrl = modelSource;
      this.modelFormat = this.detectModelFormat(modelSource);
      console.log(`📋 Formato de modelo detectado: ${this.modelFormat}`);
    }

    // Detectar hardware si no se especifica backend
    if (!preferredBackend) {
      await this.detectBestBackend();
    } else {
      this.backend = preferredBackend;
    }

    // Configurar opciones de sesión
    const sessionOptions: ort.InferenceSession.SessionOptions = {
      executionProviders: this.getExecutionProviders(),
      graphOptimizationLevel: 'all',
    };

    try {
      // Crear sesión de inferencia
      if (typeof modelSource === 'string') {
        // URL o path al modelo
        this.session = await ort.InferenceSession.create(modelSource, sessionOptions);
      } else {
        // ArrayBuffer o Uint8Array
        const modelBytes = modelSource instanceof ArrayBuffer
          ? new Uint8Array(modelSource)
          : modelSource;
        this.session = await ort.InferenceSession.create(modelBytes, sessionOptions);
      }

      this.modelLoaded = true;
      console.log(`✅ Modelo ONNX cargado con backend: ${this.backend}`);
    } catch (error) {
      console.error('Error cargando modelo ONNX:', error);

      // Fallback a WASM si falla
      if (this.backend !== 'wasm') {
        console.log('⚠️ Fallback a WASM backend...');
        this.backend = 'wasm';
        sessionOptions.executionProviders = ['wasm'];

        if (typeof modelSource === 'string') {
          this.session = await ort.InferenceSession.create(modelSource, sessionOptions);
        } else {
          const modelBytes = modelSource instanceof ArrayBuffer
            ? new Uint8Array(modelSource)
            : modelSource;
          this.session = await ort.InferenceSession.create(modelBytes, sessionOptions);
        }

        this.modelLoaded = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Obtiene los execution providers según el backend
   */
  private getExecutionProviders(): string[] {
    switch (this.backend) {
      case 'webgpu':
        return ['webgpu', 'wasm'];
      case 'webgl':
        return ['webgl', 'wasm'];
      default:
        return ['wasm'];
    }
  }

  /**
   * Ejecuta inferencia en una imagen
   */
  async runInference(
    imageData: ImageData,
    config: InferenceConfig,
    modelType: 'detection' | 'classification' = 'detection'
  ): Promise<InferenceResult> {
    if (!this.session || !this.modelLoaded) {
      throw new Error('Modelo no cargado. Llama a initialize() primero.');
    }

    const startTime = performance.now();

    // 1. Preprocesar imagen
    const tensor = preprocessImage(imageData, config.inputShape, config.preprocessing);

    // 2. Crear tensor ONNX
    const inputTensor = new ort.Tensor('float32', tensor, [
      1,
      config.inputShape.channels,
      config.inputShape.height,
      config.inputShape.width,
    ]);

    // 3. Obtener nombre del input
    const inputName = this.session.inputNames[0];

    // 4. Ejecutar inferencia
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };
    const results = await this.session.run(feeds);

    // 5. Obtener output(s)
    const outputNames = this.session.outputNames;
    const primaryOutput = results[outputNames[0]].data as Float32Array;

    // 6. Postprocesar según formato de modelo detectado
    let predictions: Prediction[];
    const postConfig = {
      confidenceThreshold: config.confidenceThreshold,
      iouThreshold: config.iouThreshold,
      maxDetections: config.maxDetections,
    };

    // Usar labels de COCO si no se proveen para modelos de detección
    const labels = config.labels.length > 1 ? config.labels : COCO_LABELS;

    switch (this.modelFormat) {
      case 'yunet':
        predictions = parseYuNetOutput(
          primaryOutput,
          config.inputShape.width,
          config.inputShape.height,
          imageData.width,
          imageData.height,
          postConfig
        );
        break;

      case 'tinyyolov2':
        predictions = parseTinyYOLOv2Output(
          primaryOutput,
          labels,
          config.inputShape.width,
          config.inputShape.height,
          imageData.width,
          imageData.height,
          postConfig
        );
        break;

      case 'ssd':
        // SSD tiene múltiples outputs: boxes y scores
        if (outputNames.length >= 2) {
          const boxes = results[outputNames[0]].data as Float32Array;
          const scores = results[outputNames[1]].data as Float32Array;
          predictions = parseSSDOutput(
            boxes,
            scores,
            labels,
            config.inputShape.width,
            config.inputShape.height,
            imageData.width,
            imageData.height,
            postConfig
          );
        } else {
          // Fallback si solo hay un output
          predictions = parseClassificationOutput(primaryOutput, labels);
        }
        break;

      case 'yolov8':
        predictions = parseYOLOv8Output(
          primaryOutput,
          labels,
          config.inputShape.width,
          config.inputShape.height,
          imageData.width,
          imageData.height,
          postConfig
        );
        break;

      case 'classification':
      default:
        predictions = parseClassificationOutput(primaryOutput, config.labels);
        break;
    }

    const inferenceTimeMs = performance.now() - startTime;

    return {
      predictions,
      inferenceTimeMs,
      inputSize: { width: imageData.width, height: imageData.height },
    };
  }

  /**
   * Obtiene el formato de modelo detectado
   */
  getModelFormat(): ModelFormat {
    return this.modelFormat;
  }

  /**
   * Obtiene información del modelo cargado
   */
  getModelInfo(): { inputNames: readonly string[]; outputNames: readonly string[] } | null {
    if (!this.session) return null;

    return {
      inputNames: this.session.inputNames,
      outputNames: this.session.outputNames,
    };
  }

  /**
   * Obtiene el backend actual
   */
  getBackend(): InferenceBackend {
    return this.backend;
  }

  /**
   * Verifica si el modelo está cargado
   */
  isLoaded(): boolean {
    return this.modelLoaded;
  }

  /**
   * Libera recursos
   */
  async dispose(): Promise<void> {
    if (this.session) {
      // ONNX Runtime Web maneja la limpieza automáticamente
      this.session = null;
      this.modelLoaded = false;
    }
  }
}

// Singleton para uso global
let globalEngine: ONNXInferenceEngine | null = null;

export function getGlobalEngine(): ONNXInferenceEngine {
  if (!globalEngine) {
    globalEngine = new ONNXInferenceEngine();
  }
  return globalEngine;
}

export function disposeGlobalEngine(): void {
  if (globalEngine) {
    globalEngine.dispose();
    globalEngine = null;
  }
}
