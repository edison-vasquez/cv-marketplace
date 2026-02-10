"use client";

import { cn } from '@/lib/utils';
import { WorkflowBlock } from '@/types/workflow';
import * as Icons from 'lucide-react';
import { ArrowDown, X, Settings2, Trash2 } from 'lucide-react';

interface WorkflowCanvasProps {
    nodes: WorkflowBlock[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onRemove: (id: string) => void;
}

export default function WorkflowCanvas({ nodes, selectedId, onSelect, onRemove }: WorkflowCanvasProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] p-20 flex flex-col items-center gap-8 min-h-screen">

            <div className="w-48 h-12 glass-card flex items-center justify-center border-dashed border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Input Stream</span>
            </div>

            <ArrowDown className="text-white/10 w-6 h-6" />

            {nodes.length === 0 ? (
                <div className="w-64 h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/20">
                    <p className="text-xs font-bold uppercase tracking-widest">Empty Workspace</p>
                    <p className="text-[10px]">Add blocks from the sidebar</p>
                </div>
            ) : (
                nodes.map((node, index) => {
                    const Icon = (Icons as any)[node.icon];
                    const isSelected = selectedId === node.id;

                    return (
                        <div key={node.id} className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-top-4">
                            <div
                                onClick={() => onSelect(node.id)}
                                className={cn(
                                    "relative w-72 p-6 glass-card group transition-all cursor-pointer flex items-center gap-4",
                                    isSelected ? "border-blue-500 shadow-2xl shadow-blue-500/20 bg-blue-500/5 scale-105" : "hover:border-white/20 hover:scale-[1.02]"
                                )}
                            >
                                <div className={cn(
                                    "p-3 rounded-xl transition-colors",
                                    isSelected ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 group-hover:text-blue-400 group-hover:bg-blue-500/10"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">{node.type}</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{node.name}</p>
                                </div>

                                <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {isSelected && (
                                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                                )}
                            </div>

                            {index < nodes.length - 1 && (
                                <ArrowDown className="text-white/10 w-6 h-6" />
                            )}

                            {index === nodes.length - 1 && (
                                <>
                                    <ArrowDown className="text-white/10 w-6 h-6" />
                                    <div className="w-48 h-12 glass-card flex items-center justify-center border-dashed border-white/20">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">JSON / Stream Out</span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
