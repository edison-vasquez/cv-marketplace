"use client";

import { useState, useEffect } from 'react';
import { WorkflowBlock } from '@/types/workflow';
import { Sliders, CheckCircle2, Play, Rocket, Loader2, X, Plus, ExternalLink } from 'lucide-react';

interface ConfigPanelProps {
    node: WorkflowBlock | null;
    onUpdate: (id: string, config: Record<string, any>) => void;
    onRun: () => void;
    testing?: boolean;
}

const AVAILABLE_CLASSES = ['Persona', 'Vehículo', 'Casco', 'Chaleco', 'Casco de Seguridad', 'Guantes', 'Mascarilla', 'Gafas de Seguridad'];

export default function ConfigPanel({ node, onUpdate, onRun, testing = false }: ConfigPanelProps) {
    const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
    const [deploying, setDeploying] = useState(false);

    // Sync local config with node config
    useEffect(() => {
        if (node) {
            setLocalConfig(node.config || {});
        }
    }, [node]);

    const updateConfig = (key: string, value: any) => {
        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);
        if (node) {
            onUpdate(node.id, { [key]: value });
        }
    };

    const toggleClass = (className: string) => {
        const currentClasses = localConfig.targetClasses || [];
        const newClasses = currentClasses.includes(className)
            ? currentClasses.filter((c: string) => c !== className)
            : [...currentClasses, className];
        updateConfig('targetClasses', newClasses);
    };

    const deployToPipeless = async () => {
        setDeploying(true);
        // Simular despliegue
        await new Promise(resolve => setTimeout(resolve, 2000));
        setDeploying(false);
        alert('¡Workflow desplegado en Pipeless exitosamente!\nAhora puedes acceder desde tu panel de Pipeless.');
    };

    if (!node) {
        return (
            <div className="w-80 border-l border-[#dadce0] bg-white p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 bg-[#f1f3f4] rounded-full flex items-center justify-center text-[#5f6368]">
                    <Sliders className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-[#202124]">Sin Bloque Seleccionado</p>
                    <p className="text-xs text-[#5f6368] mt-1">Selecciona un bloque en el canvas para configurar sus propiedades</p>
                </div>
            </div>
        );
    }

    const typeColors: Record<string, string> = {
        model: 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/20',
        logic: 'bg-[#fef7e0] text-[#f9ab00] border-[#f9ab00]/20',
        output: 'bg-[#e6f4ea] text-[#34a853] border-[#34a853]/20'
    };

    return (
        <div className="w-80 border-l border-[#dadce0] bg-white p-6 flex flex-col h-full overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a73e8]">Configuración</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${typeColors[node.type]}`}>
                        {node.type}
                    </span>
                </div>
                <h2 className="text-lg font-bold text-[#202124]">{node.name}</h2>
            </div>

            <div className="space-y-6 flex-1">
                {/* Configuración de Bloques de Modelo */}
                {(node.id.startsWith('detection') || node.type === 'model') && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#5f6368]">Umbral de Confianza</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localConfig.confidence || 40}
                                    onChange={(e) => updateConfig('confidence', parseInt(e.target.value))}
                                    className="flex-1 accent-[#1a73e8]"
                                />
                                <span className="text-sm font-medium text-[#202124] w-12 text-right">
                                    {localConfig.confidence || 40}%
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#5f6368]">Versión del Modelo</label>
                            <select
                                value={localConfig.modelVersion || 'yolov11-custom'}
                                onChange={(e) => updateConfig('modelVersion', e.target.value)}
                                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                            >
                                <option value="yolov11-custom">YOLOv11 - Personalizado (Último)</option>
                                <option value="yolov8-safety">YOLOv8 - Paquete de Seguridad</option>
                                <option value="coco-pretrained">Microsoft COCO pre-entrenado</option>
                                <option value="custom-trained">Modelo Entrenado Personalizado</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#5f6368]">Máximo de Detecciones</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={localConfig.maxDetections || 25}
                                onChange={(e) => updateConfig('maxDetections', parseInt(e.target.value))}
                                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Configuración de Bloques de Lógica */}
                {node.type === 'logic' && (
                    <div className="space-y-5">
                        {node.id.startsWith('filter') && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[#5f6368]">Confianza Mínima</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={localConfig.minConfidence || 50}
                                        onChange={(e) => updateConfig('minConfidence', parseInt(e.target.value))}
                                        className="flex-1 accent-[#1a73e8]"
                                    />
                                    <span className="text-sm font-medium text-[#202124] w-12 text-right">
                                        {localConfig.minConfidence || 50}%
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#5f6368]">Clases Objetivo</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_CLASSES.map(c => {
                                    const isSelected = (localConfig.targetClasses || []).includes(c);
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => toggleClass(c)}
                                            className={`px-2.5 py-1.5 border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                                isSelected
                                                    ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                                                    : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368] hover:border-[#1a73e8]'
                                            }`}
                                        >
                                            {c}
                                            {isSelected ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <Plus className="w-3 h-3" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {node.id.startsWith('crop') && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[#5f6368]">Relleno (px)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={localConfig.padding || 10}
                                    onChange={(e) => updateConfig('padding', parseInt(e.target.value))}
                                    className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Configuración de Bloques de Salida */}
                {node.type === 'output' && (
                    <div className="space-y-5">
                        {node.id.startsWith('webhook') && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#5f6368]">URL del Endpoint</label>
                                    <input
                                        type="url"
                                        placeholder="https://api.yourdomain.com/events"
                                        value={localConfig.webhookUrl || ''}
                                        onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#5f6368]">Método HTTP</label>
                                    <select
                                        value={localConfig.httpMethod || 'POST'}
                                        onChange={(e) => updateConfig('httpMethod', e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                                    >
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#5f6368]">Cabeceras (JSON)</label>
                                    <textarea
                                        placeholder='{"Authorization": "Bearer token"}'
                                        value={localConfig.headers || ''}
                                        onChange={(e) => updateConfig('headers', e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors font-mono"
                                    />
                                </div>
                            </>
                        )}

                        {node.id.startsWith('visualize') && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#5f6368]">Color del Recuadro</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={localConfig.boxColor || '#1a73e8'}
                                            onChange={(e) => updateConfig('boxColor', e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer border border-[#dadce0]"
                                        />
                                        <span className="text-sm font-mono text-[#5f6368]">
                                            {localConfig.boxColor || '#1a73e8'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#5f6368]">Grosor de Línea</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={localConfig.lineThickness || 2}
                                        onChange={(e) => updateConfig('lineThickness', parseInt(e.target.value))}
                                        className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="showLabels"
                                        checked={localConfig.showLabels !== false}
                                        onChange={(e) => updateConfig('showLabels', e.target.checked)}
                                        className="w-4 h-4 accent-[#1a73e8]"
                                    />
                                    <label htmlFor="showLabels" className="text-sm text-[#202124]">Mostrar Etiquetas</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="showConfidence"
                                        checked={localConfig.showConfidence !== false}
                                        onChange={(e) => updateConfig('showConfidence', e.target.checked)}
                                        className="w-4 h-4 accent-[#1a73e8]"
                                    />
                                    <label htmlFor="showConfidence" className="text-sm text-[#202124]">Mostrar Confianza</label>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-auto space-y-3 pt-6 border-t border-[#dadce0]">
                <button
                    onClick={onRun}
                    disabled={testing}
                    className="w-full py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {testing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Probando Pipeline...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-white" />
                            Probar Pipeline
                        </>
                    )}
                </button>

                <button
                    onClick={deployToPipeless}
                    disabled={deploying}
                    className="w-full py-3 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {deploying ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Desplegando...
                        </>
                    ) : (
                        <>
                            <Rocket className="w-4 h-4" />
                            Desplegar en Pipeless
                        </>
                    )}
                </button>

                <a
                    href="https://pipeless.ai/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 text-[#5f6368] hover:text-[#1a73e8] text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                    <ExternalLink className="w-3 h-3" />
                    Documentación de Pipeless
                </a>
            </div>
        </div>
    );
}
