"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Play, X, AlertCircle, Loader2, Video, VideoOff, Image as ImageIcon, Download, Zap, Server, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para el widget
interface Prediction {
    class: string;
    confidence: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    bbox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface InferenceResult {
    predictions: Prediction[];
    time?: number;
    inferenceTimeMs?: number;
    image?: {
        width: number;
        height: number;
    };
}

interface ModelMetadata {
    id: string;
    title: string;
    format?: 'onnx' | 'tfjs' | 'both' | null;
    onnxModelUrl?: string | null;
    tfjsModelUrl?: string | null;
    modelSizeBytes?: number | null;
    inputShape?: string | null;
    labels?: string | null;
    preprocessing?: string | null;
    postprocessing?: string | null;
    technical?: string;
    isPremium?: boolean;
    version?: string;
}

interface InferenceWidgetProps {
    modelId: string;
    modelMetadata?: ModelMetadata;
}

type InferenceMode = 'browser' | 'api';

export default function InferenceWidget({ modelId, modelMetadata }: InferenceWidgetProps) {
    // Modos de entrada
    const [inputMode, setInputMode] = useState<'upload' | 'webcam'>('upload');
    const [inferenceMode, setInferenceMode] = useState<InferenceMode>('browser');

    // Estados de UI
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<InferenceResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Estados de webcam
    const [webcamActive, setWebcamActive] = useState(false);
    const [webcamError, setWebcamError] = useState<string | null>(null);

    // Estados de modelo local
    const [modelLoaded, setModelLoaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [engineReady, setEngineReady] = useState(false);
    const [backendInfo, setBackendInfo] = useState<string>('');

    // Estados para tiempo real
    const [isRealtime, setIsRealtime] = useState(false);
    const [fps, setFps] = useState(0);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const engineRef = useRef<any>(null);
    const realtimeLoopRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(0);

    // Determinar si el modelo soporta inferencia local
    const supportsLocalInference = !!(
        modelMetadata?.format &&
        (modelMetadata.onnxModelUrl || modelMetadata.tfjsModelUrl)
    );

    // Determinar tipo de modelo
    const isDetectionModel = modelMetadata?.technical === 'Detection';
    const isClassificationModel = modelMetadata?.technical === 'Classification';
    const isSegmentationModel = modelMetadata?.technical === 'Segmentation';

    // Solo modelos de detección soportan webcam en tiempo real
    const supportsWebcam = isDetectionModel;

    // Debug log
    useEffect(() => {
        console.log('🔍 Model metadata:', {
            technical: modelMetadata?.technical,
            isDetectionModel,
            isClassificationModel,
            supportsWebcam
        });
    }, [modelMetadata?.technical]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRealtimeLoop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (engineRef.current?.dispose) {
                engineRef.current.dispose();
            }
        };
    }, []);

    // Real-time inference loop
    const startRealtimeLoop = useCallback(() => {
        if (!engineRef.current || !engineRef.current.isLoaded()) return;

        setIsRealtime(true);
        let frameCount = 0;
        let lastFpsUpdate = performance.now();

        const runFrame = async () => {
            if (!videoRef.current || !overlayCanvasRef.current || !isRealtime) {
                return;
            }

            const video = videoRef.current;
            if (video.readyState !== 4) {
                realtimeLoopRef.current = requestAnimationFrame(runFrame);
                return;
            }

            try {
                // Capturar frame del video
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(video, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Ejecutar inferencia
                const config = getModelConfig();
                const result = await engineRef.current.runInference(imageData, {
                    confidenceThreshold: config.postprocessing.confidenceThreshold,
                    iouThreshold: config.postprocessing.iouThreshold,
                    maxDetections: config.postprocessing.maxDetections,
                    inputShape: config.inputShape,
                    labels: config.labels,
                    preprocessing: config.preprocessing,
                }, 'detection');

                // Dibujar bounding boxes en overlay
                drawDetections(result.predictions, video.videoWidth, video.videoHeight);

                // Actualizar FPS
                frameCount++;
                const now = performance.now();
                if (now - lastFpsUpdate >= 1000) {
                    setFps(frameCount);
                    frameCount = 0;
                    lastFpsUpdate = now;
                }

                // Actualizar resultado
                setResult({
                    predictions: result.predictions.map((p: any) => ({
                        class: p.class,
                        confidence: p.confidence,
                        x: p.bbox ? p.bbox.x + p.bbox.width / 2 : 0,
                        y: p.bbox ? p.bbox.y + p.bbox.height / 2 : 0,
                        width: p.bbox?.width || 0,
                        height: p.bbox?.height || 0,
                    })),
                    time: result.inferenceTimeMs,
                    image: { width: video.videoWidth, height: video.videoHeight },
                });

            } catch (err) {
                console.error('Error en frame:', err);
            }

            realtimeLoopRef.current = requestAnimationFrame(runFrame);
        };

        realtimeLoopRef.current = requestAnimationFrame(runFrame);
    }, [isRealtime]);

    const stopRealtimeLoop = useCallback(() => {
        setIsRealtime(false);
        if (realtimeLoopRef.current) {
            cancelAnimationFrame(realtimeLoopRef.current);
            realtimeLoopRef.current = null;
        }
        // Limpiar overlay
        if (overlayCanvasRef.current) {
            const ctx = overlayCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
            }
        }
    }, []);

    // Dibujar detecciones en el canvas overlay
    const drawDetections = (predictions: any[], videoWidth: number, videoHeight: number) => {
        const overlay = overlayCanvasRef.current;
        const video = videoRef.current;
        if (!overlay || !video) return;

        // Obtener dimensiones del video en pantalla
        const displayWidth = video.clientWidth;
        const displayHeight = video.clientHeight;

        // Configurar canvas para que coincida con el video mostrado
        overlay.width = displayWidth;
        overlay.height = displayHeight;

        const ctx = overlay.getContext('2d')!;
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Calcular escala y offset para object-contain
        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (displayWidth - videoWidth * scale) / 2;
        const offsetY = (displayHeight - videoHeight * scale) / 2;

        // Colores para diferentes niveles de confianza
        const getColor = (confidence: number) => {
            if (confidence >= 0.7) return '#22c55e'; // Verde
            if (confidence >= 0.5) return '#eab308'; // Amarillo
            return '#ef4444'; // Rojo
        };

        predictions.forEach((pred) => {
            if (!pred.bbox) return;

            const { x, y, width, height } = pred.bbox;
            const confidence = pred.confidence || 0;
            const color = getColor(confidence);

            // Escalar coordenadas al tamaño mostrado
            const scaledX = x * scale + offsetX;
            const scaledY = y * scale + offsetY;
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;

            // Dibujar rectángulo con borde grueso
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // Dibujar esquinas resaltadas
            const cornerLength = Math.min(scaledWidth, scaledHeight) * 0.2;
            ctx.lineWidth = 4;
            ctx.beginPath();
            // Esquina superior izquierda
            ctx.moveTo(scaledX, scaledY + cornerLength);
            ctx.lineTo(scaledX, scaledY);
            ctx.lineTo(scaledX + cornerLength, scaledY);
            // Esquina superior derecha
            ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY);
            ctx.lineTo(scaledX + scaledWidth, scaledY);
            ctx.lineTo(scaledX + scaledWidth, scaledY + cornerLength);
            // Esquina inferior derecha
            ctx.moveTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerLength);
            ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
            ctx.lineTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
            // Esquina inferior izquierda
            ctx.moveTo(scaledX + cornerLength, scaledY + scaledHeight);
            ctx.lineTo(scaledX, scaledY + scaledHeight);
            ctx.lineTo(scaledX, scaledY + scaledHeight - cornerLength);
            ctx.stroke();

            // Dibujar etiqueta con fondo
            const label = `${pred.class} ${(confidence * 100).toFixed(0)}%`;
            ctx.font = 'bold 14px Arial';
            const textMetrics = ctx.measureText(label);
            const textWidth = textMetrics.width;
            const textHeight = 20;
            const padding = 6;

            // Fondo de la etiqueta
            ctx.fillStyle = color;
            const labelX = scaledX;
            const labelY = scaledY - textHeight - padding;
            ctx.beginPath();
            ctx.roundRect(labelX, labelY, textWidth + padding * 2, textHeight + padding, 4);
            ctx.fill();

            // Texto de la etiqueta
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, labelX + padding, labelY + textHeight / 2 + padding / 2);
        });
    };

    // Efecto para iniciar/detener el loop en tiempo real
    useEffect(() => {
        if (isRealtime && webcamActive && engineReady) {
            startRealtimeLoop();
        }
        return () => {
            if (realtimeLoopRef.current) {
                cancelAnimationFrame(realtimeLoopRef.current);
            }
        };
    }, [isRealtime, webcamActive, engineReady]);

    // Cargar motor ONNX cuando se selecciona modo browser
    useEffect(() => {
        if (inferenceMode === 'browser' && supportsLocalInference && !modelLoaded) {
            loadModelInBrowser();
        }
    }, [inferenceMode, supportsLocalInference]);

    // Cargar modelo en el navegador
    const loadModelInBrowser = async () => {
        if (!modelMetadata?.onnxModelUrl) {
            setError('Este modelo no tiene archivo ONNX disponible');
            return;
        }

        try {
            setIsDownloading(true);
            setError(null);

            // Importar dinámicamente para code splitting
            const { ONNXInferenceEngine } = await import('@/lib/inference/onnx-engine');
            const { modelCache } = await import('@/lib/inference/model-cache');
            const { downloadWithProgress, formatBytes } = await import('@/lib/inference/model-downloader');

            const engine = new ONNXInferenceEngine();
            engineRef.current = engine;

            // Detectar hardware
            const hwInfo = await engine.detectBestBackend();
            setBackendInfo(`${hwInfo.backend.toUpperCase()}${hwInfo.gpuName ? ` (${hwInfo.gpuName})` : ''}`);

            // Verificar caché
            const cached = await modelCache.get(modelId);
            if (cached) {
                console.log('✅ Modelo encontrado en caché');
                setDownloadProgress(100);
                await engine.initialize(cached.blobUrl);
                setModelLoaded(true);
                setEngineReady(true);
                setIsDownloading(false);
                return;
            }

            // Descargar modelo con progreso
            console.log('📥 Descargando modelo...');
            const modelBlob = await downloadWithProgress(
                modelMetadata.onnxModelUrl,
                (progress) => {
                    setDownloadProgress(progress.percentage);
                }
            );

            // Guardar en caché
            const blobUrl = URL.createObjectURL(modelBlob);
            await modelCache.set(modelId, modelBlob, modelMetadata.version || '1.0.0');

            // Inicializar motor
            await engine.initialize(blobUrl);

            setModelLoaded(true);
            setEngineReady(true);
            console.log('✅ Modelo cargado y listo');

        } catch (err) {
            console.error('Error cargando modelo:', err);
            setError(`Error cargando modelo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    // Parsear metadata del modelo
    const getModelConfig = () => {
        const defaultConfig = {
            inputShape: { width: 640, height: 640, channels: 3 },
            labels: ['object'],
            preprocessing: { mean: [0, 0, 0], std: [1, 1, 1], normalize: true, channelOrder: 'RGB' as const },
            postprocessing: { confidenceThreshold: 0.5, iouThreshold: 0.45, maxDetections: 100 }
        };

        try {
            if (modelMetadata?.inputShape) {
                defaultConfig.inputShape = JSON.parse(modelMetadata.inputShape);
            }
            if (modelMetadata?.labels) {
                defaultConfig.labels = JSON.parse(modelMetadata.labels);
            }
            if (modelMetadata?.preprocessing) {
                defaultConfig.preprocessing = { ...defaultConfig.preprocessing, ...JSON.parse(modelMetadata.preprocessing) };
            }
            if (modelMetadata?.postprocessing) {
                defaultConfig.postprocessing = { ...defaultConfig.postprocessing, ...JSON.parse(modelMetadata.postprocessing) };
            }
        } catch (e) {
            console.warn('Error parseando config del modelo:', e);
        }

        return defaultConfig;
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError(null);
        setResult(null);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Por favor sube un archivo de imagen (JPG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen debe ser menor a 5MB');
            return;
        }

        setPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const startWebcam = async () => {
        setWebcamError(null);
        try {
            console.log('🎥 Solicitando acceso a cámara...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            console.log('✅ Stream obtenido:', stream.getVideoTracks()[0]?.label);

            streamRef.current = stream;

            if (videoRef.current) {
                const video = videoRef.current;
                video.srcObject = stream;

                // Activar webcam inmediatamente para mostrar el video
                setWebcamActive(true);

                // Intentar reproducir
                try {
                    await video.play();
                    console.log('✅ Video reproduciendo');
                } catch (playErr) {
                    console.warn('Auto-play bloqueado, esperando interacción:', playErr);
                    // En algunos navegadores, autoplay está bloqueado
                    // El usuario puede hacer clic para reproducir
                }
            } else {
                console.error('videoRef no está disponible');
                setWebcamError('Error interno: elemento de video no disponible');
            }
        } catch (err) {
            console.error('Webcam error:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setWebcamError('Permiso de cámara denegado. Por favor permite el acceso en la configuración del navegador.');
                } else if (err.name === 'NotFoundError') {
                    setWebcamError('No se encontró ninguna cámara en este dispositivo.');
                } else if (err.name === 'NotReadableError') {
                    setWebcamError('La cámara está siendo usada por otra aplicación.');
                } else {
                    setWebcamError(`Error de cámara: ${err.message}`);
                }
            } else {
                setWebcamError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
            }
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setWebcamActive(false);
    };

    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
    }, []);

    // Inferencia LOCAL en el navegador
    const runLocalInference = async (imageUrl: string) => {
        if (!engineRef.current || !engineRef.current.isLoaded()) {
            throw new Error('Motor de inferencia no está listo');
        }

        const { base64ToImageData } = await import('@/lib/inference/preprocessing');

        // Convertir imagen a ImageData
        const imageData = await base64ToImageData(imageUrl);

        // Obtener configuración del modelo
        const config = getModelConfig();

        // Determinar tipo de modelo
        const modelType = modelMetadata?.technical === 'Classification' ? 'classification' : 'detection';

        // Ejecutar inferencia
        const result = await engineRef.current.runInference(imageData, {
            confidenceThreshold: config.postprocessing.confidenceThreshold,
            iouThreshold: config.postprocessing.iouThreshold,
            maxDetections: config.postprocessing.maxDetections,
            inputShape: config.inputShape,
            labels: config.labels,
            preprocessing: config.preprocessing,
        }, modelType);

        return {
            predictions: result.predictions.map((p: any) => ({
                class: p.class,
                confidence: p.confidence,
                x: p.bbox ? p.bbox.x + p.bbox.width / 2 : 0,
                y: p.bbox ? p.bbox.y + p.bbox.height / 2 : 0,
                width: p.bbox?.width || 0,
                height: p.bbox?.height || 0,
            })),
            time: result.inferenceTimeMs,
            image: result.inputSize,
        };
    };

    // Inferencia via API (legacy/premium)
    const runApiInference = async (imageUrl: string) => {
        let base64data: string;

        if (imageUrl.startsWith('data:')) {
            base64data = imageUrl.split(',')[1];
        } else {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();

            base64data = await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const result = reader.result?.toString().split(',')[1];
                    if (result) resolve(result);
                    else reject(new Error('Failed to read image'));
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        const res = await fetch('/api/inference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64data,
                modelId: modelId
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Inference failed');
        }

        return data;
    };

    const runInference = async (imageData?: string) => {
        const imageToProcess = imageData || preview;
        if (!imageToProcess) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            let inferenceResult: InferenceResult;

            if (inferenceMode === 'browser' && engineReady) {
                // Inferencia local en navegador
                inferenceResult = await runLocalInference(imageToProcess);
            } else {
                // Inferencia via API
                inferenceResult = await runApiInference(imageToProcess);
            }

            if (inferenceResult.predictions) {
                setResult(inferenceResult);
            } else {
                throw new Error('No predictions returned');
            }
        } catch (err) {
            console.error('Inference error:', err);
            setError(err instanceof Error ? err.message : 'Error ejecutando inferencia');
        } finally {
            setLoading(false);
        }
    };

    const runWebcamInference = async () => {
        const frame = captureFrame();
        if (frame) {
            setPreview(frame);
            await runInference(frame);
        }
    };

    const clearAll = () => {
        setPreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Formatear tamaño de archivo
    const formatSize = (bytes?: number | null) => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6">
            {/* Header con selector de modo de inferencia */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#202124] flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#1a73e8] fill-[#1a73e8]" />
                    Probar Modelo
                </h3>
            </div>

            {/* Selector de modo de inferencia */}
            {supportsLocalInference && (
                <div className="mb-4 p-3 bg-white border border-[#dadce0] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#1a73e8]" />
                        <span className="text-sm font-medium text-[#202124]">Modo de Ejecución</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setInferenceMode('browser')}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2",
                                inferenceMode === 'browser'
                                    ? "bg-[#1a73e8] text-white"
                                    : "bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]"
                            )}
                        >
                            <HardDrive className="w-3.5 h-3.5" />
                            En Navegador (Gratis)
                        </button>
                        <button
                            onClick={() => setInferenceMode('api')}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2",
                                inferenceMode === 'api'
                                    ? "bg-[#1a73e8] text-white"
                                    : "bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]"
                            )}
                        >
                            <Server className="w-3.5 h-3.5" />
                            API Server
                        </button>
                    </div>

                    {/* Estado de descarga del modelo */}
                    {inferenceMode === 'browser' && (
                        <div className="mt-3">
                            {isDownloading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#5f6368] flex items-center gap-1">
                                            <Download className="w-3 h-3 animate-pulse" />
                                            Descargando modelo...
                                        </span>
                                        <span className="text-[#1a73e8] font-medium">{downloadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-[#e8eaed] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#1a73e8] transition-all duration-300"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                    {modelMetadata?.modelSizeBytes && (
                                        <p className="text-xs text-[#5f6368]">
                                            {formatSize(modelMetadata.modelSizeBytes * downloadProgress / 100)} / {formatSize(modelMetadata.modelSizeBytes)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {modelLoaded && (
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span>Modelo listo • {backendInfo}</span>
                                </div>
                            )}

                            {!isDownloading && !modelLoaded && !error && (
                                <button
                                    onClick={loadModelInBrowser}
                                    className="w-full py-2 bg-[#e8f0fe] text-[#1a73e8] rounded-lg text-xs font-medium hover:bg-[#d2e3fc] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Descargar Modelo ({formatSize(modelMetadata?.modelSizeBytes)})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Selector de entrada (Upload/Webcam) - Webcam solo para Detection */}
            {supportsWebcam ? (
                <div className="flex gap-1 bg-[#e8f0fe] p-1 rounded-lg mb-4">
                    <button
                        onClick={() => { setInputMode('upload'); stopWebcam(); }}
                        className={cn(
                            "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                            inputMode === 'upload' ? "bg-white text-[#1a73e8] shadow-sm" : "text-[#5f6368] hover:text-[#202124]"
                        )}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Subir Imagen
                    </button>
                    <button
                        onClick={() => setInputMode('webcam')}
                        className={cn(
                            "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                            inputMode === 'webcam' ? "bg-white text-[#1a73e8] shadow-sm" : "text-[#5f6368] hover:text-[#202124]"
                        )}
                    >
                        <Camera className="w-3.5 h-3.5" />
                        Cámara en Tiempo Real
                    </button>
                </div>
            ) : (
                <div className="mb-4 p-2 bg-[#e8f0fe] rounded-lg flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#1a73e8]" />
                    <span className="text-xs text-[#5f6368]">
                        {isClassificationModel ? 'Modelo de Clasificación - Sube una imagen para analizar' :
                         isSegmentationModel ? 'Modelo de Segmentación - Sube una imagen para segmentar' :
                         'Sube una imagen para procesar'}
                    </span>
                </div>
            )}

            {/* Hidden inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Upload mode */}
            {inputMode === 'upload' && (
                <>
                    {!preview ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
                                dragActive ? "border-[#1a73e8] bg-[#e8f0fe]" : "border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f1f3f4]"
                            )}
                        >
                            <div className="w-12 h-12 bg-[#e8f0fe] rounded-full flex items-center justify-center">
                                <Upload className="w-6 h-6 text-[#1a73e8]" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-[#202124]">Arrastra una imagen o haz clic para subir</p>
                                <p className="text-xs text-[#5f6368] mt-1">JPG, PNG hasta 5MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Imagen con overlay de detecciones */}
                            <div className="relative rounded-xl overflow-hidden border border-[#dadce0] bg-[#202124]">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                    onLoad={(e) => {
                                        // Guardar dimensiones reales de la imagen mostrada
                                        const img = e.target as HTMLImageElement;
                                        console.log('Imagen cargada:', img.naturalWidth, 'x', img.naturalHeight);
                                    }}
                                />
                                {/* Overlay de detecciones usando canvas */}
                                {result && result.predictions.length > 0 && isDetectionModel && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {result.predictions.map((p, i) => {
                                            const imgWidth = result.image?.width || 640;
                                            const imgHeight = result.image?.height || 480;

                                            // Usar bbox directamente si existe
                                            const bboxX = p.bbox?.x ?? (p.x !== undefined ? p.x - (p.width || 0) / 2 : 0);
                                            const bboxY = p.bbox?.y ?? (p.y !== undefined ? p.y - (p.height || 0) / 2 : 0);
                                            const bboxW = p.bbox?.width ?? p.width ?? 0;
                                            const bboxH = p.bbox?.height ?? p.height ?? 0;

                                            if (!bboxW || !bboxH) return null;

                                            // Calcular posición como porcentaje
                                            const leftPercent = (bboxX / imgWidth) * 100;
                                            const topPercent = (bboxY / imgHeight) * 100;
                                            const widthPercent = (bboxW / imgWidth) * 100;
                                            const heightPercent = (bboxH / imgHeight) * 100;

                                            // Color basado en confianza
                                            const color = p.confidence >= 0.7 ? '#22c55e' : p.confidence >= 0.5 ? '#eab308' : '#ef4444';

                                            return (
                                                <div
                                                    key={i}
                                                    className="absolute"
                                                    style={{
                                                        left: `${leftPercent}%`,
                                                        top: `${topPercent}%`,
                                                        width: `${widthPercent}%`,
                                                        height: `${heightPercent}%`,
                                                    }}
                                                >
                                                    {/* Bounding box */}
                                                    <div
                                                        className="absolute inset-0 border-2"
                                                        style={{ borderColor: color }}
                                                    />
                                                    {/* Label */}
                                                    <div
                                                        className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-bold text-white rounded-t whitespace-nowrap"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {p.class} {(p.confidence * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <button
                                    onClick={clearAll}
                                    className="absolute top-2 right-2 p-1.5 bg-[#202124]/80 hover:bg-[#202124] rounded-full transition-colors z-10"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            <button
                                onClick={() => runInference()}
                                disabled={loading || (inferenceMode === 'browser' && !engineReady)}
                                className="w-full py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" />
                                        {inferenceMode === 'browser' ? 'Ejecutar Localmente' : 'Ejecutar via API'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Webcam mode - Solo para Detection */}
            {inputMode === 'webcam' && supportsWebcam && (
                <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-[#dadce0] bg-[#202124]" style={{ minHeight: '300px' }}>
                        {/* Video element always in DOM, visibility controlled by CSS */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-auto max-h-[400px] object-contain mx-auto ${webcamActive ? 'block' : 'hidden'}`}
                        />
                        {/* Canvas overlay para dibujar detecciones en tiempo real - se posiciona sobre el video */}
                        <canvas
                            ref={overlayCanvasRef}
                            className={`absolute top-0 left-0 w-full h-full pointer-events-none ${webcamActive && isRealtime ? 'block' : 'hidden'}`}
                            style={{ objectFit: 'contain' }}
                        />
                        {webcamActive ? (
                            <>
                                {/* Indicador de tiempo real */}
                                {isRealtime && (
                                    <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                                        <div className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            EN VIVO
                                        </div>
                                        <div className="bg-[#202124]/80 text-white text-xs px-2 py-1 rounded shadow-lg">
                                            {fps} FPS
                                        </div>
                                        {result && result.time && (
                                            <div className="bg-[#1a73e8]/80 text-white text-xs px-2 py-1 rounded shadow-lg">
                                                {result.time.toFixed(0)}ms
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Contador de objetos detectados */}
                                {isRealtime && result && result.predictions.length > 0 && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded shadow-lg">
                                            {result.predictions.length} objeto{result.predictions.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                )}
                                {/* Panel de detecciones en vivo */}
                                {isRealtime && result && result.predictions.length > 0 && (
                                    <div className="absolute bottom-2 left-2 right-2 bg-[#202124]/90 backdrop-blur-sm rounded-lg p-3 z-10">
                                        <div className="flex flex-wrap gap-2">
                                            {result.predictions.slice(0, 8).map((p, i) => {
                                                const color = p.confidence >= 0.7 ? 'bg-green-500' : p.confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500';
                                                return (
                                                    <span key={i} className={`${color} text-white text-xs font-medium px-2 py-1 rounded`}>
                                                        {p.class} {(p.confidence * 100).toFixed(0)}%
                                                    </span>
                                                );
                                            })}
                                            {result.predictions.length > 8 && (
                                                <span className="bg-[#5f6368] text-white text-xs font-medium px-2 py-1 rounded">
                                                    +{result.predictions.length - 8} más
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-16">
                                <div className="w-16 h-16 bg-[#f1f3f4] rounded-full flex items-center justify-center">
                                    <Video className="w-8 h-8 text-[#5f6368]" />
                                </div>
                                <p className="text-sm text-[#5f6368]">Cámara no activa</p>
                            </div>
                        )}
                    </div>

                    {webcamError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{webcamError}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {!webcamActive ? (
                            <button
                                onClick={startWebcam}
                                className="flex-1 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Video className="w-4 h-4" />
                                Iniciar Cámara
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => { stopRealtimeLoop(); stopWebcam(); }}
                                    className="flex-1 py-3 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#5f6368] rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <VideoOff className="w-4 h-4" />
                                    Detener
                                </button>
                                {inferenceMode === 'browser' && engineReady ? (
                                    /* Botón de tiempo real para inferencia local */
                                    <button
                                        onClick={() => isRealtime ? stopRealtimeLoop() : setIsRealtime(true)}
                                        className={cn(
                                            "flex-[2] py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                            isRealtime
                                                ? "bg-red-600 hover:bg-red-700 text-white"
                                                : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                                        )}
                                    >
                                        {isRealtime ? (
                                            <>
                                                <VideoOff className="w-4 h-4" />
                                                Detener Tiempo Real
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Detección en Tiempo Real
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    /* Botón de captura única para API */
                                    <button
                                        onClick={runWebcamInference}
                                        disabled={loading || (inferenceMode === 'browser' && !engineReady)}
                                        className="flex-[2] py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4" />
                                                Capturar y Analizar
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">Error de Inferencia</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Results display */}
            {result && result.predictions.length > 0 && (
                <div className="mt-4 p-4 bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a73e8]">
                            Resultados
                            {inferenceMode === 'browser' && (
                                <span className="ml-2 px-1.5 py-0.5 bg-[#1a73e8]/10 rounded text-[10px] font-normal">
                                    LOCAL
                                </span>
                            )}
                        </h4>
                        {(result.time || result.inferenceTimeMs) && (
                            <span className="text-xs text-[#5f6368]">
                                {(result.time || result.inferenceTimeMs || 0).toFixed(0)}ms
                            </span>
                        )}
                    </div>
                    <div className="space-y-2">
                        {result.predictions.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <span className="text-sm font-medium text-[#202124]">{p.class}</span>
                                <span className={cn(
                                    "text-sm font-bold",
                                    p.confidence >= 0.8 ? "text-green-600" :
                                    p.confidence >= 0.5 ? "text-yellow-600" : "text-red-600"
                                )}>
                                    {(p.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result && result.predictions.length === 0 && (
                <div className="mt-4 p-4 bg-[#fef7e0] border border-[#f9ab00]/20 rounded-xl">
                    <p className="text-sm text-[#5f6368]">No se detectaron objetos en esta imagen. Intenta con una imagen diferente.</p>
                </div>
            )}
        </div>
    );
}
