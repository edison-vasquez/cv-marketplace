"use client";

import { useState, useEffect } from 'react';
import { Cpu, Zap, ShieldCheck, AlertTriangle, Monitor, Activity, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HardwareDetails {
    gpu: string;
    api: string;
    performance: string;
    vendor: string;
    estimatedMs: string;
}

interface WebGPUAdapterInfo {
    vendor?: string;
    device?: string;
    description?: string;
    architecture?: string;
}

interface WebGPU {
    requestAdapter(): Promise<GPUAdapter | null>;
}

interface GPUAdapter {
    info: WebGPUAdapterInfo;
}

async function detectWebGPU(): Promise<{ supported: boolean; adapterInfo?: WebGPUAdapterInfo }> {
    if (!('gpu' in navigator)) {
        return { supported: false };
    }

    try {
        const gpu = (navigator as Navigator & { gpu: WebGPU }).gpu;
        const adapter = await gpu.requestAdapter() as any;
        if (!adapter) {
            return { supported: false };
        }

        return { supported: true, adapterInfo: adapter.info };
    } catch {
        return { supported: false };
    }
}

function detectWebGL(): { supported: boolean; renderer: string; vendor: string } {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            return { supported: false, renderer: 'Unknown', vendor: 'Unknown' };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
            return { supported: true, renderer, vendor };
        }

        return {
            supported: true,
            renderer: gl.getParameter(gl.RENDERER) as string || 'WebGL Renderer',
            vendor: gl.getParameter(gl.VENDOR) as string || 'Unknown'
        };
    } catch {
        return { supported: false, renderer: 'Unknown', vendor: 'Unknown' };
    }
}

function estimatePerformance(gpuName: string): { level: string; ms: string } {
    const gpuLower = gpuName.toLowerCase();

    // GPUs de alta gama
    if (gpuLower.includes('rtx 40') || gpuLower.includes('rtx 30') ||
        gpuLower.includes('a100') || gpuLower.includes('h100') ||
        gpuLower.includes('m3 pro') || gpuLower.includes('m3 max') ||
        gpuLower.includes('m2 pro') || gpuLower.includes('m2 max')) {
        return { level: 'Alto Rendimiento', ms: '8-15ms' };
    }

    // GPUs de gama media
    if (gpuLower.includes('rtx 20') || gpuLower.includes('gtx 16') ||
        gpuLower.includes('rx 6') || gpuLower.includes('rx 7') ||
        gpuLower.includes('m1') || gpuLower.includes('m2') || gpuLower.includes('m3') ||
        gpuLower.includes('intel arc') || gpuLower.includes('iris')) {
        return { level: 'Buen Rendimiento', ms: '15-30ms' };
    }

    // GPUs integradas/gama baja
    if (gpuLower.includes('intel uhd') || gpuLower.includes('intel hd') ||
        gpuLower.includes('radeon graphics') || gpuLower.includes('vega')) {
        return { level: 'Rendimiento Moderado', ms: '30-60ms' };
    }

    return { level: 'Rendimiento Estándar', ms: '20-40ms' };
}

export default function HardwareCheck() {
    const [status, setStatus] = useState<'checking' | 'ready' | 'warning' | 'error'>('checking');
    const [details, setDetails] = useState<HardwareDetails>({
        gpu: 'Detectando...',
        api: 'Verificando...',
        performance: 'Analizando...',
        vendor: '',
        estimatedMs: ''
    });

    useEffect(() => {
        async function detectHardware() {
            // First try WebGPU (modern, preferred)
            const webgpuResult = await detectWebGPU();

            if (webgpuResult.supported && webgpuResult.adapterInfo) {
                const info = webgpuResult.adapterInfo;
                const gpuName = info.device || info.description || 'WebGPU Device';
                const vendor = info.vendor || 'Unknown Vendor';
                const perf = estimatePerformance(gpuName);

                setDetails({
                    gpu: gpuName,
                    api: 'WebGPU',
                    performance: perf.level,
                    vendor: vendor,
                    estimatedMs: perf.ms
                });
                setStatus('ready');
                return;
            }

            // Fallback to WebGL
            const webglResult = detectWebGL();

            if (webglResult.supported) {
                const perf = estimatePerformance(webglResult.renderer);

                setDetails({
                    gpu: webglResult.renderer,
                    api: 'WebGL 2.0',
                    performance: perf.level,
                    vendor: webglResult.vendor,
                    estimatedMs: perf.ms
                });
                setStatus('warning');
                return;
            }

            // No se detectó soporte de GPU
            setDetails({
                gpu: 'Sin GPU Detectada',
                api: 'Solo CPU (WASM)',
                performance: 'Rendimiento Bajo',
                vendor: 'N/A',
                estimatedMs: '100-500ms'
            });
            setStatus('error');
        }

        // Small delay for UX
        const timer = setTimeout(detectHardware, 100);
        return () => clearTimeout(timer);
    }, []);

    const statusConfig = {
        ready: {
            icon: ShieldCheck,
            text: 'Listo',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700'
        },
        warning: {
            icon: AlertTriangle,
            text: 'Compatible',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-700'
        },
        error: {
            icon: XCircle,
            text: 'Limitado',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-700'
        },
        checking: {
            icon: Activity,
            text: 'Verificando',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700'
        }
    };

    const currentStatus = statusConfig[status];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#dadce0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#5f6368]" />
                    <h3 className="text-sm font-bold text-[#202124]">Hardware Detectado</h3>
                </div>
                <span className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                    currentStatus.bgColor,
                    currentStatus.textColor
                )}>
                    <StatusIcon className="w-3 h-3" />
                    {currentStatus.text}
                </span>
            </div>

            <div className="p-4 space-y-3">
                {/* GPU */}
                <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 bg-[#e8f0fe] rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#1a73e8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#5f6368]">Procesador Gráfico</p>
                        <p className="text-sm font-medium text-[#202124] truncate" title={details.gpu}>
                            {details.gpu}
                        </p>
                    </div>
                </div>

                {/* API */}
                <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 bg-[#fef7e0] rounded-lg flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-[#f9ab00]" />
                    </div>
                    <div>
                        <p className="text-xs text-[#5f6368]">Backend de Ejecución</p>
                        <p className={cn(
                            "text-sm font-medium",
                            details.api.includes('WebGPU') ? "text-green-600" :
                                details.api.includes('WebGL') ? "text-yellow-600" : "text-red-600"
                        )}>
                            {details.api}
                        </p>
                    </div>
                </div>

                {/* Performance */}
                <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 bg-[#e6f4ea] rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#34a853]" />
                    </div>
                    <div>
                        <p className="text-xs text-[#5f6368]">Inferencia Estimada</p>
                        <p className="text-sm font-medium text-[#202124]">
                            {details.performance}
                            {details.estimatedMs && (
                                <span className="text-[#5f6368] font-normal ml-1">
                                    ({details.estimatedMs})
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info box */}
            <div className={cn(
                "mx-4 mb-4 p-3 rounded-lg text-xs",
                currentStatus.bgColor,
                "border",
                currentStatus.borderColor
            )}>
                <p className={cn("leading-relaxed", currentStatus.textColor)}>
                    {status === 'ready' && (
                        <>Tu navegador soporta WebGPU. Obtendrás el mejor rendimiento ejecutando modelos localmente.</>
                    )}
                    {status === 'warning' && (
                        <>Tu navegador soporta WebGL. Los modelos funcionarán pero considera usar Chrome/Edge para mejor rendimiento con WebGPU.</>
                    )}
                    {status === 'error' && (
                        <>No se detectó aceleración GPU. Los modelos se ejecutarán en CPU (más lento). Considera usar la API de servidor.</>
                    )}
                    {status === 'checking' && (
                        <>Detectando capacidades de tu navegador...</>
                    )}
                </p>
            </div>
        </div>
    );
}
