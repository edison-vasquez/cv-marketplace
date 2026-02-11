import Link from 'next/link';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCTAProps {
    variant?: 'banner' | 'card';
    heading?: string;
    description?: string;
}

export default function ServiceCTA({
    variant = 'banner',
    heading,
    description
}: ServiceCTAProps) {
    const defaultHeading = variant === 'banner'
        ? '¿Necesitas una Solución de CV Personalizada?'
        : '¿Necesitas este modelo adaptado?';

    const defaultDescription = variant === 'banner'
        ? 'Entrenamos, desplegamos y mantenemos modelos de visión artificial adaptados a tu industria y caso de uso específico.'
        : 'Entrenamos modelos con tus datos propios y los desplegamos en tu infraestructura.';

    if (variant === 'card') {
        return (
            <div className="bg-gradient-to-br from-[#f8f9fa] to-[#e8f0fe] border border-[#dadce0] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#1a73e8]" />
                    <h3 className="text-sm font-bold text-[#202124]">{heading || defaultHeading}</h3>
                </div>
                <p className="text-xs text-[#5f6368] mb-4 leading-relaxed">
                    {description || defaultDescription}
                </p>
                <a
                    href="mailto:edison@jhedai.com?subject=Consulta%20VisionHub%20-%20Modelo%20Custom"
                    className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Contactar Equipo
                </a>
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1a73e8] to-[#4285f4] rounded-2xl p-8 md:p-12 my-12">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-xl rotate-12" />
                <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full" />
                <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white rounded-lg -rotate-6" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {heading || defaultHeading}
                </h2>
                <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">
                    {description || defaultDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="mailto:edison@jhedai.com?subject=Consulta%20VisionHub%20-%20Soluci%C3%B3n%20Custom"
                        className="px-6 py-3 bg-white text-[#1a73e8] rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Agendar Consulta
                    </a>
                    <Link
                        href="/pricing"
                        className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                        Ver Precios
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
