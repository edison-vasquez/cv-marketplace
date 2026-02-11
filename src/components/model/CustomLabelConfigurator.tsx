"use client";

import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

interface CustomLabelConfiguratorProps {
    onLabelsChange: (labels: string[]) => void;
}

const suggestedLabels = [
    'persona', 'casco', 'vehículo', 'caja', 'fuego',
    'animal', 'herramienta', 'señalización'
];

export default function CustomLabelConfigurator({ onLabelsChange }: CustomLabelConfiguratorProps) {
    const [labels, setLabels] = useState<string[]>([]);
    const [input, setInput] = useState('');

    const addLabel = (label: string) => {
        const trimmed = label.trim().toLowerCase();
        if (trimmed && !labels.includes(trimmed)) {
            const newLabels = [...labels, trimmed];
            setLabels(newLabels);
            onLabelsChange(newLabels);
        }
        setInput('');
    };

    const removeLabel = (label: string) => {
        const newLabels = labels.filter(l => l !== label);
        setLabels(newLabels);
        onLabelsChange(newLabels);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLabel(input);
        }
    };

    return (
        <div className="bg-white border border-[#dadce0] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#1a73e8]" />
                <h4 className="text-sm font-bold text-[#202124]">Detector Personalizado</h4>
            </div>
            <p className="text-xs text-[#5f6368] mb-3">
                Define qué objetos quieres detectar. Esta es una simulación del potencial de un modelo entrenado específicamente para tu caso.
            </p>

            {/* Input */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: casco, vehículo..."
                    className="flex-1 px-3 py-2 border border-[#dadce0] rounded-lg text-sm text-[#202124] outline-none focus:border-[#1a73e8] transition-colors"
                />
                <button
                    onClick={() => addLabel(input)}
                    disabled={!input.trim()}
                    className="px-3 py-2 bg-[#1a73e8] text-white rounded-lg text-sm font-medium hover:bg-[#1557b0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar
                </button>
            </div>

            {/* Active labels */}
            {labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {labels.map(label => (
                        <span
                            key={label}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e8f0fe] text-[#1a73e8] rounded-full text-xs font-medium"
                        >
                            {label}
                            <button onClick={() => removeLabel(label)} className="hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Suggestions */}
            <div className="mb-3">
                <span className="text-xs text-[#80868b] block mb-1.5">Sugerencias:</span>
                <div className="flex flex-wrap gap-1.5">
                    {suggestedLabels.filter(s => !labels.includes(s)).map(label => (
                        <button
                            key={label}
                            onClick={() => addLabel(label)}
                            className="px-2 py-0.5 border border-[#dadce0] rounded-full text-xs text-[#5f6368] hover:border-[#1a73e8] hover:text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
                        >
                            + {label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}
