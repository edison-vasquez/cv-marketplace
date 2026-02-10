import { ArrowLeft, Check, Zap, Building2, Rocket } from 'lucide-react'
import Link from 'next/link'

const tiers = [
    {
        name: 'Explorador',
        price: 'Gratis',
        description: 'Para entusiastas y pruebas iniciales de concepto.',
        features: [
            'Inferencia en navegador (modelos gratuitos)',
            '100 llamadas API al día',
            'Acceso al Hub de modelos públicos',
            'Soporte por comunidad',
        ],
        cta: 'Empezar Gratis',
        href: '/',
        featured: false,
    },
    {
        name: 'Profesional',
        price: 'Custom',
        description: 'Soluciones optimizadas para PYMES y flujos industriales.',
        features: [
            'Inferencia 100% local ilimitada',
            'Inferencia en la nube (API) dedicada',
            'Acceso a todos los modelos Premium',
            'Soporte por email 24/7',
            'Dashboard de analítica avanzada',
        ],
        cta: 'Solicitar Demo',
        href: 'mailto:ventas@visionhub.com?subject=Solicitud de Demo Profesional',
        featured: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Infraestructura robusta para operaciones a gran escala.',
        features: [
            'Modelos entrenados a medida (Custom AI)',
            'SLA garantizado del 99.9%',
            'Despliegue On-Premise / Edge',
            'Gerente de cuenta dedicado',
            'Integración directa con SAP/ERP',
        ],
        cta: 'Contactar Ventas',
        href: 'mailto:ventas@visionhub.com?subject=Consulta Corporativa Enterprise',
        featured: false,
    },
]

export default function PricingPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-12 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver al Marketplace
            </Link>

            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-[#202124] tracking-tight">
                    Escala tu visión industrial
                </h1>
                <p className="text-lg text-[#5f6368]">
                    Planes flexibles diseñados para adaptarse a la complejidad de tus procesos, desde una sola línea hasta toda la planta.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.name}
                        className={`relative p-8 rounded-3xl border transition-all duration-300 ${tier.featured
                                ? 'bg-white border-[#1a73e8] shadow-2xl scale-105 z-10'
                                : 'bg-[#f8f9fa] border-[#dadce0] hover:border-[#1a73e8]/30'
                            }`}
                    >
                        {tier.featured && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                Recomendado
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {tier.name === 'Explorador' && <Rocket className="w-5 h-5 text-[#1a73e8]" />}
                                    {tier.name === 'Profesional' && <Zap className="w-5 h-5 text-[#1a73e8]" />}
                                    {tier.name === 'Enterprise' && <Building2 className="w-5 h-5 text-[#1a73e8]" />}
                                    <h3 className="text-xl font-bold text-[#202124]">{tier.name}</h3>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-[#202124]">{tier.price}</span>
                                    {tier.price === 'Gratis' && <span className="text-sm text-[#5f6368]">/siempre</span>}
                                </div>
                                <p className="text-sm text-[#5f6368] leading-relaxed">
                                    {tier.description}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-[#dadce0] space-y-4">
                                {tier.features.map((feature) => (
                                    <div key={feature} className="flex gap-3">
                                        <Check className="w-5 h-5 text-[#1a73e8] shrink-0" />
                                        <span className="text-sm text-[#3c4043] font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={tier.href}
                                className={`block w-full py-4 px-6 rounded-xl text-center font-bold text-sm transition-all ${tier.featured
                                        ? 'bg-[#1a73e8] text-white hover:bg-[#185abc] shadow-lg shadow-[#1a73e8]/20'
                                        : 'bg-white text-[#1a73e8] border border-[#dadce0] hover:bg-[#e8f0fe] hover:border-[#1a73e8]/30'
                                    }`}
                            >
                                {tier.cta}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trust Section */}
            <div className="mt-24 pt-16 border-t border-[#dadce0] text-center">
                <p className="text-sm font-bold text-[#5f6368] uppercase tracking-widest mb-8">
                    Tecnología de grado industrial
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
                    {/* Logo Placeholders with text */}
                    <span className="text-2xl font-black text-[#202124]">LOGISTICS+</span>
                    <span className="text-2xl font-black text-[#202124]">SAFETYFIRST</span>
                    <span className="text-2xl font-black text-[#202124]">QUALTIX</span>
                    <span className="text-2xl font-black text-[#202124]">MINEO</span>
                </div>
            </div>
        </div>
    )
}
