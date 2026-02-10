"use client";

import { cn } from '@/lib/utils';
import { AVAILABLE_BLOCKS } from '@/types/workflow';
import * as Icons from 'lucide-react';

export default function WorkflowSidebar({ onAddBlock }: { onAddBlock: (type: string) => void }) {
    return (
        <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-8 h-full">
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">Bloques de Pipeline</h3>

                <div className="space-y-8">
                    {['model', 'logic', 'output'].map((group) => (
                        <div key={group}>
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 pl-1">{group}s</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {AVAILABLE_BLOCKS.filter(b => b.type === group).map((block) => {
                                    const Icon = (Icons as any)[block.icon];
                                    return (
                                        <button
                                            key={block.id}
                                            onClick={() => onAddBlock(block.id)}
                                            className="flex items-center gap-3 p-3 glass-card hover:bg-white/10 transition-all border-white/5 group text-left"
                                        >
                                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/80">{block.name}</p>
                                                <p className="text-[10px] text-white/30 truncate w-32">{block.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Integración con Roboflow</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                        Arrastra estos bloques para crear un pipeline de CV complejo. Exporta directamente a Pipeless.
                    </p>
                </div>
            </div>
        </div>
    );
}
