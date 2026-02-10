"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import WorkflowSidebar from '@/components/workflow/WorkflowSidebar';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import ConfigPanel from '@/components/workflow/ConfigPanel';
import { WorkflowBlock, AVAILABLE_BLOCKS } from '@/types/workflow';
import { ArrowLeft, Save, Share2, Download, Loader2, Check, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

function WorkflowBuilderContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const workflowId = searchParams.get('id');

    const [nodes, setNodes] = useState<WorkflowBlock[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState('Workflow sin título');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId);
    const [shareId, setShareId] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);

    // Load workflow from API or localStorage
    useEffect(() => {
        async function loadWorkflow() {
            if (workflowId && session?.user) {
                try {
                    const res = await fetch(`/api/workflows/${workflowId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setNodes(JSON.parse(data.nodes));
                        setWorkflowName(data.name);
                        setWorkflowDescription(data.description || '');
                        setCurrentWorkflowId(data.id);
                        setShareId(data.shareId);
                    }
                } catch (e) {
                    console.error("Failed to load workflow from API", e);
                }
            } else {
                // Load from localStorage for non-authenticated users or new workflows
                const saved = localStorage.getItem('cv_marketplace_workflow');
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        setNodes(data.nodes || []);
                        setWorkflowName(data.name || 'Workflow sin título');
                    } catch (e) {
                        console.error("Failed to load workflow", e);
                    }
                }
            }
        }

        if (status !== 'loading') {
            loadWorkflow();
        }
    }, [workflowId, session, status]);

    // Auto-save to localStorage
    useEffect(() => {
        if (nodes.length > 0) {
            localStorage.setItem('cv_marketplace_workflow', JSON.stringify({
                nodes,
                name: workflowName
            }));
        }
    }, [nodes, workflowName]);

    const addBlock = (blockId: string) => {
        const template = AVAILABLE_BLOCKS.find(b => b.id === blockId);
        if (!template) return;

        const newNode: WorkflowBlock = {
            ...template,
            id: `${template.id}-${Date.now()}`,
            config: {}
        };

        setNodes(prev => [...prev, newNode]);
        setSelectedId(newNode.id);
    };

    const removeNode = (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
        ));
    }, []);

    const saveWorkflow = async () => {
        if (!session?.user) {
            router.push('/auth/signin?callbackUrl=/workflow/builder');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                name: workflowName,
                description: workflowDescription,
                nodes: JSON.stringify(nodes),
                isPublic: false
            };

            const url = currentWorkflowId
                ? `/api/workflows/${currentWorkflowId}`
                : '/api/workflows';

            const res = await fetch(url, {
                method: currentWorkflowId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar el workflow');
            }

            const data = await res.json();
            setCurrentWorkflowId(data.id);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);

            // Update URL with workflow ID
            if (!currentWorkflowId) {
                router.replace(`/workflow/builder?id=${data.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const shareWorkflow = async () => {
        if (!currentWorkflowId) {
            await saveWorkflow();
        }

        if (!currentWorkflowId && !session?.user) {
            return;
        }

        try {
            const res = await fetch(`/api/workflows/${currentWorkflowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isPublic: true,
                    shareId: shareId || `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                })
            });

            if (res.ok) {
                const data = await res.json();
                setShareId(data.shareId);

                // Copiar enlace al portapapeles
                const shareUrl = `${window.location.origin}/workflow/shared/${data.shareId}`;
                await navigator.clipboard.writeText(shareUrl);
                alert(`¡Enlace copiado al portapapeles!\n${shareUrl}`);
            }
        } catch (err) {
            setError('Error al compartir el workflow');
        }
    };

    const exportJSON = () => {
        const workflowData = {
            name: workflowName,
            description: workflowDescription,
            version: '1.0',
            nodes: nodes,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const runTestPipeline = async () => {
        if (nodes.length === 0) {
            setError('Agrega al menos un bloque para probar el pipeline');
            return;
        }

        setTesting(true);
        setTestResults(null);
        setError(null);

        try {
            // Simulate pipeline execution
            await new Promise(resolve => setTimeout(resolve, 1500));

            const results = {
                success: true,
                executionTime: Math.floor(Math.random() * 100) + 50,
                nodesExecuted: nodes.length,
                steps: nodes.map((node) => ({
                    name: node.name,
                    status: 'completed',
                    time: Math.floor(Math.random() * 30) + 10,
                    output: node.type === 'model'
                        ? { detections: Math.floor(Math.random() * 5) + 1 }
                        : node.type === 'logic'
                            ? { filtered: Math.floor(Math.random() * 3) }
                            : { sent: true }
                }))
            };

            setTestResults(results);
        } catch (err) {
            setError('Error en la prueba del pipeline');
        } finally {
            setTesting(false);
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedId) || null;

    return (
        <div className="fixed inset-0 bg-[#f8f9fa] flex flex-col pt-16">
            {/* Upper Toolbar */}
            <div className="h-16 border-b border-[#dadce0] px-6 flex items-center justify-between bg-white">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-2 hover:bg-[#f1f3f4] rounded-lg transition-colors text-[#5f6368] hover:text-[#202124]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="text-sm font-bold text-[#202124] bg-transparent outline-none border-b border-transparent hover:border-[#dadce0] focus:border-[#1a73e8] transition-colors"
                            placeholder="Nombre del workflow..."
                        />
                        <p className="text-[10px] text-[#5f6368] font-medium">
                            {currentWorkflowId ? 'Guardado' : 'Borrador'} • {nodes.length} bloques
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!session?.user && (
                        <Link
                            href="/auth/signin?callbackUrl=/workflow/builder"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Inicia sesión para guardar
                        </Link>
                    )}

                    <button
                        onClick={shareWorkflow}
                        disabled={!session?.user || saving}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>

                    <button
                        onClick={saveWorkflow}
                        disabled={saving || !session?.user}
                        className="flex items-center gap-2 px-4 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-lg text-xs font-medium text-[#202124] transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saveSuccess ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar Borrador'}
                    </button>

                    <button
                        onClick={exportJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar JSON
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <WorkflowSidebar onAddBlock={addBlock} />

                <div className="flex-1 relative flex flex-col bg-[#f1f3f4]">
                    <WorkflowCanvas
                        nodes={nodes}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onRemove={removeNode}
                    />

                    {/* Overlay de Resultados de Prueba */}
                    {testResults && (
                        <div className="absolute bottom-4 left-4 right-4 max-w-md bg-white border border-[#dadce0] rounded-xl shadow-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-[#202124]">Resultados de la Prueba</h4>
                                <button
                                    onClick={() => setTestResults(null)}
                                    className="text-[#5f6368] hover:text-[#202124]"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-[#5f6368]">
                                    Tiempo de ejecución: <span className="font-medium text-[#202124]">{testResults.executionTime}ms</span>
                                </p>
                                {testResults.steps.map((step: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-[#f8f9fa] rounded-lg p-2">
                                        <span className="text-[#202124]">{step.name}</span>
                                        <span className="text-green-600 font-medium">{step.time}ms</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ConfigPanel
                    node={selectedNode}
                    onUpdate={updateNodeConfig}
                    onRun={runTestPipeline}
                    testing={testing}
                />
            </div>
        </div>
    );
}

export default function WorkflowBuilderPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-[#f8f9fa] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
            </div>
        }>
            <WorkflowBuilderContent />
        </Suspense>
    );
}
