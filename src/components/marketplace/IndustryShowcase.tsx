"use client";

import { Factory, Shield, Stethoscope, Tractor, Zap, Truck, HardHat, ShoppingCart, Microscope, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndustryShowcaseProps {
    categories: string[];
    onSelectCategory: (category: string) => void;
}

const industryConfig: Record<string, { icon: any; description: string; color: string }> = {
    'Industrial': { icon: Factory, description: 'Inspección y control de calidad', color: '#1a73e8' },
    'Security': { icon: Shield, description: 'Vigilancia y detección de riesgos', color: '#ea4335' },
    'Healthcare': { icon: Stethoscope, description: 'Diagnóstico y análisis médico', color: '#34a853' },
    'Agriculture': { icon: Tractor, description: 'Monitoreo de cultivos y ganado', color: '#f9ab00' },
    'Energy': { icon: Zap, description: 'Inspección de infraestructura energética', color: '#ff6d01' },
    'Logistics': { icon: Truck, description: 'Seguimiento y optimización logística', color: '#4285f4' },
    'Construction': { icon: HardHat, description: 'Seguridad y progreso de obra', color: '#9334e9' },
    'Retail': { icon: ShoppingCart, description: 'Análisis de estanterías y clientes', color: '#e91e63' },
    'Manufacturing': { icon: Microscope, description: 'Defectos y control de procesos', color: '#00bcd4' },
    'Corporate': { icon: Building2, description: 'Gestión de espacios inteligentes', color: '#607d8b' },
};

const defaultConfig = { icon: Factory, description: 'Soluciones de visión artificial', color: '#5f6368' };

export default function IndustryShowcase({ categories, onSelectCategory }: IndustryShowcaseProps) {
    // Show top 8 categories that have config
    const displayCategories = categories.slice(0, 8);

    if (displayCategories.length === 0) return null;

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-[#202124]">Industrias que Transformamos</h2>
                <span className="text-sm text-[#5f6368]">{categories.length} sectores</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
                {displayCategories.map(cat => {
                    const config = industryConfig[cat] || defaultConfig;
                    const Icon = config.icon;

                    return (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat)}
                            className="flex-shrink-0 snap-start w-[200px] md:w-auto group p-4 bg-white border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:shadow-md transition-all text-left"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${config.color}15` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: config.color }} />
                            </div>
                            <h3 className="text-sm font-semibold text-[#202124] mb-1">{cat}</h3>
                            <p className="text-xs text-[#5f6368] line-clamp-2">{config.description}</p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
