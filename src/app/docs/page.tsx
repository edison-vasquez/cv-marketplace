"use client";

import { Book, HelpCircle, Zap, Cpu, MessageSquare, ArrowRight, Video, Code, Eye, Bell, Download, Play } from "lucide-react";
import Link from "next/link";
import { getAllDocs, getDocsByCategory, type DocSection } from '@/lib/docs';

const iconMap: Record<string, React.ReactNode> = {
    'Download': <Download className="w-6 h-6 text-[#1a73e8]" />,
    'Cpu': <Cpu className="w-6 h-6 text-[#1a73e8]" />,
    'Play': <Play className="w-6 h-6 text-[#1a73e8]" />,
    'Zap': <Zap className="w-6 h-6 text-[#f9ab00]" />,
    'Video': <Video className="w-6 h-6 text-[#34a853]" />,
    'Bell': <Bell className="w-6 h-6 text-[#ea4335]" />,
    'Code': <Code className="w-6 h-6 text-[#9334e9]" />,
    'Eye': <Eye className="w-6 h-6 text-[#1a73e8]" />,
    'HelpCircle': <HelpCircle className="w-6 h-6 text-[#5f6368]" />,
};

const categoryConfig: Record<DocSection['category'], { title: string; description: string; color: string }> = {
    'getting-started': {
        title: 'Primeros Pasos',
        description: 'Todo lo que necesitas para comenzar con VisionHub',
        color: 'border-[#1a73e8]/20 bg-[#e8f0fe]'
    },
    'guides': {
        title: 'Guías',
        description: 'Tutoriales detallados y guías prácticas',
        color: 'border-[#34a853]/20 bg-[#e6f4ea]'
    },
    'api': {
        title: 'Referencia de API',
        description: 'Documentación técnica para desarrolladores',
        color: 'border-[#9334e9]/20 bg-[#f3e8fd]'
    },
    'faq': {
        title: 'FAQ',
        description: 'Preguntas frecuentes',
        color: 'border-[#5f6368]/20 bg-[#f8f9fa]'
    }
};

export default function DocsPage() {
    const categories: DocSection['category'][] = ['getting-started', 'guides', 'api', 'faq'];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Encabezado */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f0fe] rounded-full text-[#1a73e8] text-xs font-bold uppercase tracking-wider mb-6">
                    <Book className="w-4 h-4" />
                    Documentación
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#202124] mb-6">
                    <span className="text-[#1a73e8]">Documentación</span> de VisionHub
                </h1>
                <p className="text-lg text-[#5f6368] max-w-2xl mx-auto">
                    Todo lo que necesitas para desplegar modelos de visión por computadora en dispositivos edge.
                </p>
            </div>

            {/* Enlaces Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                <Link
                    href="/docs/installation"
                    className="p-6 bg-[#1a73e8] text-white rounded-2xl hover:bg-[#1557b0] transition-colors group"
                >
                    <Download className="w-8 h-8 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Guía de Inicio Rápido</h3>
                    <p className="text-white/80 text-sm mb-4">Comienza a funcionar en menos de 5 minutos.</p>
                    <span className="text-sm font-medium flex items-center gap-2">
                        Comenzar ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                <Link
                    href="/docs/inference-api"
                    className="p-6 bg-white border border-[#dadce0] rounded-2xl hover:border-[#1a73e8] transition-colors group"
                >
                    <Code className="w-8 h-8 text-[#1a73e8] mb-4" />
                    <h3 className="text-lg font-bold text-[#202124] mb-2">Referencia de API</h3>
                    <p className="text-[#5f6368] text-sm mb-4">Integra VisionHub en tus aplicaciones.</p>
                    <span className="text-[#1a73e8] text-sm font-medium flex items-center gap-2">
                        Ver documentación <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                <Link
                    href="/docs/faq"
                    className="p-6 bg-white border border-[#dadce0] rounded-2xl hover:border-[#1a73e8] transition-colors group"
                >
                    <HelpCircle className="w-8 h-8 text-[#5f6368] mb-4" />
                    <h3 className="text-lg font-bold text-[#202124] mb-2">FAQ</h3>
                    <p className="text-[#5f6368] text-sm mb-4">Preguntas y respuestas comunes.</p>
                    <span className="text-[#1a73e8] text-sm font-medium flex items-center gap-2">
                        Leer FAQ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>

            {/* Categories */}
            <div className="space-y-12">
                {categories.map(category => {
                    const docs = getDocsByCategory(category);
                    const config = categoryConfig[category];

                    return (
                        <section key={category}>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-[#202124]">{config.title}</h2>
                                <div className="h-px bg-[#dadce0] flex-1" />
                            </div>
                            <p className="text-[#5f6368] mb-6">{config.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {docs.map(doc => (
                                    <Link
                                        key={doc.slug}
                                        href={`/docs/${doc.slug}`}
                                        className={`p-6 border rounded-xl hover:shadow-md transition-all group ${config.color}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                                            {iconMap[doc.icon] || <Book className="w-6 h-6 text-[#5f6368]" />}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#202124] mb-2 group-hover:text-[#1a73e8] transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="text-sm text-[#5f6368] mb-4 line-clamp-2">
                                            {doc.description}
                                        </p>
                                        <span className="text-[#1a73e8] text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Leer más <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* CTA de Soporte */}
            <div className="mt-20 text-center bg-[#f8f9fa] border border-[#dadce0] p-12 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-[#1a73e8] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#202124] mb-4">¿Aún tienes preguntas?</h3>
                <p className="text-[#5f6368] mb-8 max-w-lg mx-auto">
                    Nuestro equipo de soporte está disponible para ayudarte a configurar tus cámaras o diseñar un modelo personalizado.
                </p>
                <button className="px-8 py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-medium transition-colors">
                    Contactar Soporte
                </button>
            </div>
        </div>
    );
}
