"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Monitor, Play, AlertCircle, Video, Settings, ArrowRight, Download, Activity, Globe, Loader2, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Deployment {
    id: string;
    name: string;
    status: string;
    type: string;
    metrics: string | null;
    config: string | null;
    modelId: string;
    createdAt: string;
    updatedAt: string;
    lastActiveAt: string | null;
    model: {
        id: string;
        title: string;
        slug: string;
        image: string;
        technical: string;
    };
}

interface SystemStatus {
    roboflowApi: 'checking' | 'connected' | 'error';
    webgpu: 'checking' | 'available' | 'unavailable';
    localServer: 'checking' | 'ready' | 'not_configured';
}

export default function DeploymentPage() {
    const { data: session, status } = useSession();
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        roboflowApi: 'checking',
        webgpu: 'checking',
        localServer: 'checking'
    });
    const [deleting, setDeleting] = useState<string | null>(null);

    // Fetch deployments
    useEffect(() => {
        async function fetchDeployments() {
            if (!session?.user) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/deployments');
                if (res.ok) {
                    const data = await res.json();
                    setDeployments(data);
                }
            } catch (error) {
                console.error('Error fetching deployments:', error);
            } finally {
                setLoading(false);
            }
        }

        if (status !== 'loading') {
            fetchDeployments();
        }
    }, [session, status]);

    // Check system status
    useEffect(() => {
        async function checkSystemStatus() {
            // Check Roboflow API
            try {
                const res = await fetch('/api/inference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ healthCheck: true })
                });
                setSystemStatus(prev => ({ ...prev, roboflowApi: res.ok ? 'connected' : 'error' }));
            } catch {
                setSystemStatus(prev => ({ ...prev, roboflowApi: 'error' }));
            }

            // Check WebGPU
            if ('gpu' in navigator) {
                try {
                    const gpu = (navigator as Navigator & { gpu: { requestAdapter: () => Promise<any> } }).gpu;
                    const adapter = await gpu.requestAdapter();
                    setSystemStatus(prev => ({ ...prev, webgpu: adapter ? 'available' : 'unavailable' }));
                } catch {
                    setSystemStatus(prev => ({ ...prev, webgpu: 'unavailable' }));
                }
            } else {
                setSystemStatus(prev => ({ ...prev, webgpu: 'unavailable' }));
            }

            // Local server is simulated as ready
            setSystemStatus(prev => ({ ...prev, localServer: 'ready' }));
        }

        checkSystemStatus();
    }, []);

    const deleteDeployment = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este despliegue?')) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/deployments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDeployments(prev => prev.filter(d => d.id !== id));
            }
        } catch (error) {
            console.error('Error deleting deployment:', error);
        } finally {
            setDeleting(null);
        }
    };

    const updateDeploymentStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/deployments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, lastActiveAt: new Date().toISOString() })
            });
            if (res.ok) {
                const updated = await res.json();
                setDeployments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
            }
        } catch (error) {
            console.error('Error updating deployment:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'running':
                return 'bg-green-500/20 border-green-500/30 text-green-400';
            case 'stopped':
            case 'paused':
                return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
            case 'error':
            case 'failed':
                return 'bg-red-500/20 border-red-500/30 text-red-400';
            default:
                return 'bg-[#5f6368]/20 border-[#5f6368]/30 text-[#5f6368]';
        }
    };

    const StatusIcon = ({ status }: { status: 'checking' | 'connected' | 'available' | 'ready' | 'error' | 'unavailable' | 'not_configured' }) => {
        if (status === 'checking') return <Loader2 className="w-3 h-3 animate-spin text-[#5f6368]" />;
        if (status === 'connected' || status === 'available' || status === 'ready') return <CheckCircle2 className="w-3 h-3 text-green-500" />;
        return <XCircle className="w-3 h-3 text-red-500" />;
    };

    const getStatusText = (status: 'checking' | 'connected' | 'available' | 'ready' | 'error' | 'unavailable' | 'not_configured') => {
        const texts: Record<string, string> = {
            checking: 'Verificando...',
            connected: 'Conectado',
            available: 'Disponible',
            ready: 'Listo',
            error: 'Error',
            unavailable: 'No disponible',
            not_configured: 'No configurado'
        };
        return texts[status];
    };

    const getStatusTextColor = (status: 'checking' | 'connected' | 'available' | 'ready' | 'error' | 'unavailable' | 'not_configured') => {
        if (status === 'checking') return 'text-[#5f6368]';
        if (status === 'connected' || status === 'available' || status === 'ready') return 'text-green-600';
        return 'text-red-600';
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Encabezado */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-[#202124] mb-4">
                    Centro de <span className="text-[#1a73e8]">Despliegue</span>
                </h1>
                <p className="text-[#5f6368]">
                    Gestiona tus modelos activos, revisa el rendimiento y configura tus despliegues.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column - Active Deployments */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#1a73e8]" />
                                Tus Despliegues
                            </h2>
                            {session?.user && (
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Desplegar Nuevo Modelo
                                </Link>
                            )}
                        </div>

                        {!session?.user ? (
                            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-12 text-center">
                                <LogIn className="w-12 h-12 text-[#5f6368] mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-[#202124] mb-2">Inicia sesión para ver despliegues</h3>
                                <p className="text-[#5f6368] mb-6">Necesitas iniciar sesión para gestionar tus despliegues.</p>
                                <Link
                                    href="/auth/signin?callbackUrl=/deployment"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg font-medium transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
                            </div>
                        ) : deployments.length === 0 ? (
                            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-12 text-center">
                                <Monitor className="w-12 h-12 text-[#5f6368] mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-[#202124] mb-2">Aún no hay despliegues</h3>
                                <p className="text-[#5f6368] mb-6">Comienza desplegando un modelo desde el marketplace.</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg font-medium transition-colors"
                                >
                                    Explorar Modelos
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {deployments.map((dep) => {
                                    const metrics = dep.metrics ? JSON.parse(dep.metrics) : {};
                                    return (
                                        <div key={dep.id} className="bg-white border border-[#dadce0] rounded-2xl p-6 hover:border-[#1a73e8]/30 transition-all">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Model Image */}
                                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 relative bg-[#f1f3f4]">
                                                    {dep.model?.image && (
                                                        <img src={dep.model.image} alt={dep.name} className="w-full h-full object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    <div className="absolute bottom-3 left-3">
                                                        <span className={`px-2 py-1 border text-[8px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(dep.status)}`}>
                                                            {dep.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-[#202124] mb-1">{dep.name}</h3>
                                                            <p className="text-xs text-[#5f6368]">
                                                                {dep.type} • {dep.model?.title || 'Modelo Desconocido'} •
                                                                Última actividad: {dep.lastActiveAt ? new Date(dep.lastActiveAt).toLocaleDateString() : 'Nunca'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteDeployment(dep.id)}
                                                            disabled={deleting === dep.id}
                                                            className="p-2 hover:bg-[#f1f3f4] rounded-lg transition-colors text-[#5f6368] hover:text-red-500"
                                                        >
                                                            {deleting === dep.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        <div className="p-3 bg-[#f8f9fa] rounded-xl">
                                                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#5f6368] mb-1">Detecciones</p>
                                                            <p className="text-sm font-bold text-[#1a73e8]">{metrics.detections?.toLocaleString() || '0'}</p>
                                                        </div>
                                                        <div className="p-3 bg-[#f8f9fa] rounded-xl">
                                                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#5f6368] mb-1">FPS Promedio</p>
                                                            <p className="text-sm font-bold text-green-600">{metrics.fps || 'N/A'}</p>
                                                        </div>
                                                        <div className="p-3 bg-[#f8f9fa] rounded-xl">
                                                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#5f6368] mb-1">Tiempo Activo</p>
                                                            <p className="text-sm font-bold text-[#202124]">{metrics.uptime || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        {dep.status === 'active' || dep.status === 'running' ? (
                                                            <button
                                                                onClick={() => updateDeploymentStatus(dep.id, 'stopped')}
                                                                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                Detener
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => updateDeploymentStatus(dep.id, 'running')}
                                                                className="flex-1 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Play className="w-3 h-3 fill-current" />
                                                                Iniciar
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/models/${dep.model?.slug || dep.modelId}`}
                                                            className="px-6 py-3 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                                                        >
                                                            Ver Modelo
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Sección de Guía de Configuración */}
                    <section className="p-8 rounded-2xl bg-gradient-to-br from-[#e8f0fe] to-[#f3e8fd] border border-[#1a73e8]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-[#1a73e8]/10">
                            <Video className="w-32 h-32 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-[#202124] mb-4">Guía de Configuración de Cámara</h3>
                            <p className="text-[#5f6368] text-sm mb-8 max-w-lg leading-relaxed">
                                ¿Tienes problemas para conectar tu cámara? Sigue estos pasos para sincronizar tus dispositivos con el Desktop Runner.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a73e8] flex items-center justify-center font-bold text-white">1</div>
                                    <p className="text-sm font-bold text-[#202124]">Conecta Tu Cámara</p>
                                    <p className="text-xs text-[#5f6368] leading-normal">Asegúrate de que tu webcam o cámara IP esté en la misma red que tu PC.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a73e8] flex items-center justify-center font-bold text-white">2</div>
                                    <p className="text-sm font-bold text-[#202124]">Ejecuta el Programa</p>
                                    <p className="text-xs text-[#5f6368] leading-normal">Ejecuta el archivo descargado. Iniciará automáticamente el motor de IA.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a73e8] flex items-center justify-center font-bold text-white">3</div>
                                    <p className="text-sm font-bold text-[#202124]">Selecciona la Fuente</p>
                                    <p className="text-xs text-[#5f6368] leading-normal">Dentro de la app, elige tu dispositivo de la lista desplegable.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar - Estado del Sistema */}
                <div className="space-y-6">
                    <div className="bg-white border border-[#dadce0] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5f6368]">Estado del Sistema</h3>
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 hover:bg-[#f1f3f4] rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-[#5f6368]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-[#1a73e8]" />
                                    <span className="text-sm font-medium text-[#202124]">Roboflow API</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={systemStatus.roboflowApi} />
                                    <span className={`text-xs font-bold ${getStatusTextColor(systemStatus.roboflowApi)}`}>
                                        {getStatusText(systemStatus.roboflowApi)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-4 h-4 text-[#1a73e8]" />
                                    <span className="text-sm font-medium text-[#202124]">Soporte WebGPU</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={systemStatus.webgpu} />
                                    <span className={`text-xs font-bold ${getStatusTextColor(systemStatus.webgpu)}`}>
                                        {getStatusText(systemStatus.webgpu)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-4 h-4 text-[#1a73e8]" />
                                    <span className="text-sm font-medium text-[#202124]">Servidor Local</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={systemStatus.localServer} />
                                    <span className={`text-xs font-bold ${getStatusTextColor(systemStatus.localServer)}`}>
                                        {getStatusText(systemStatus.localServer)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#1a73e8] text-white space-y-4 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl" />
                        <Download className="w-8 h-8 mb-2" />
                        <h3 className="text-lg font-bold leading-tight">¿Necesitas una App Móvil Corporativa?</h3>
                        <p className="text-white/80 text-xs leading-relaxed">
                            Podemos crear una versión personalizada para tu equipo con alertas de seguridad por WhatsApp.
                        </p>
                        <button className="flex items-center gap-2 text-xs font-bold pt-2 hover:underline">
                            Hablar con un experto <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-white border border-[#dadce0] rounded-2xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5f6368] mb-4">¿Necesitas Ayuda?</h3>
                        <div className="space-y-2">
                            <Link href="/docs" className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f1f3f4] transition-colors group">
                                <span className="text-sm font-medium text-[#202124]">Preguntas Frecuentes</span>
                                <ArrowRight className="w-4 h-4 text-[#5f6368] opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/docs" className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f1f3f4] transition-colors group">
                                <span className="text-sm font-medium text-[#202124]">Manual de Cámara IP</span>
                                <ArrowRight className="w-4 h-4 text-[#5f6368] opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/docs" className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f1f3f4] transition-colors group">
                                <span className="text-sm font-medium text-[#202124]">Documentación de API</span>
                                <ArrowRight className="w-4 h-4 text-[#5f6368] opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
