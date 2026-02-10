import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {
    InferenceConfig,
    InferenceResult,
    Prediction,
    InferenceBackend,
} from './types';

export class TFJSInferenceEngine {
    private model: any = null;
    private backend: InferenceBackend = 'webgl';
    private modelLoaded = false;
    private modelFormat: 'coco-ssd' | 'custom' = 'coco-ssd';

    /**
     * Inicializa el motor de TFJS
     */
    async initialize(
        modelUrl?: string,
        preferredBackend?: InferenceBackend
    ): Promise<void> {
        // 1. Configurar backend
        if (preferredBackend) {
            this.backend = preferredBackend;
        } else {
            // Auto-detección: WebGPU > WebGL > CPU
            if (tf.findBackend('webgpu')) {
                this.backend = 'webgpu';
            } else if (tf.findBackend('webgl')) {
                this.backend = 'webgl';
            } else {
                this.backend = 'cpu';
            }
        }

        try {
            await tf.setBackend(this.backend === 'wasm' ? 'cpu' : this.backend);
            await tf.ready();
            console.log(`✅ TFJS Backend configurado: ${tf.getBackend()}`);

            // 2. Cargar modelo (por ahora soportamos COCO-SSD por defecto)
            if (!modelUrl || modelUrl.includes('coco-ssd')) {
                this.model = await cocoSsd.load();
                this.modelFormat = 'coco-ssd';
            } else {
                // Carga genérica de Graph Model
                this.model = await tf.loadGraphModel(modelUrl);
                this.modelFormat = 'custom';
            }

            this.modelLoaded = true;
            console.log('✅ Modelo TFJS cargado exitosamente');
        } catch (error) {
            console.error('Error inicializando TFJS:', error);
            throw error;
        }
    }

    /**
     * Ejecuta inferencia
     */
    async runInference(
        imageData: ImageData,
        config: InferenceConfig,
        modelType: 'detection' | 'classification' = 'detection'
    ): Promise<InferenceResult> {
        if (!this.modelLoaded || !this.model) {
            throw new Error('Modelo TFJS no cargado');
        }

        const startTime = performance.now();

        let predictions: Prediction[] = [];

        if (this.modelFormat === 'coco-ssd') {
            // El modelo COCO-SSD interno acepta el canvas o imageData directamente
            const results = await this.model.detect(imageData);

            predictions = results.map((res: any) => ({
                class: res.class,
                classId: 0, // coco-ssd no expone ID numérico fácilmente
                confidence: res.score,
                bbox: {
                    x: res.bbox[0],
                    y: res.bbox[1],
                    width: res.bbox[2],
                    height: res.bbox[3]
                }
            }));
        } else {
            // Implementación básica para custom Graph Models
            const tensor = tf.browser.fromPixels(imageData)
                .resizeNearestNeighbor([config.inputShape.height, config.inputShape.width])
                .toFloat()
                .expandDims();

            const results = await this.model.predict(tensor);
            // Aquí se requeriría post-procesamiento específico para cada modelo custom
            // Por simplicidad en este MVP, retornamos vacío o implementamos una lógica básica
            tf.dispose(tensor);
            if (results.dispose) results.dispose();
        }

        const inferenceTimeMs = performance.now() - startTime;

        return {
            predictions,
            inferenceTimeMs,
            inputSize: { width: imageData.width, height: imageData.height }
        };
    }

    isLoaded(): boolean {
        return this.modelLoaded;
    }

    async dispose(): Promise<void> {
        if (this.model && this.model.dispose) {
            this.model.dispose();
        }
        this.model = null;
        this.modelLoaded = false;
    }
}

let globalTFJSEngine: TFJSInferenceEngine | null = null;

export function getGlobalTFJSEngine(): TFJSInferenceEngine {
    if (!globalTFJSEngine) {
        globalTFJSEngine = new TFJSInferenceEngine();
    }
    return globalTFJSEngine;
}
