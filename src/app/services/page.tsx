import { Metadata } from 'next';
import { Brain, Cloud, Code, BarChart3, CheckCircle2 } from 'lucide-react';
import ServiceCTA from '@/components/shared/ServiceCTA';

export const metadata: Metadata = {
    title: 'Soluciones | VisionHub',
    description: 'Soluciones de visión artificial personalizadas: entrenamiento custom, despliegue flexible, integración API y monitoreo continuo para tu negocio.',
};

export default function ServicesPage() {
    const services = [
        {
            icon: Brain,
            title: 'Entrenamiento Custom',
            subtitle: 'Entrenamos modelos de IA con tus datos',
            description: 'Recopilamos, etiquetamos y entrenamos modelos específicos para tu caso de uso. Desde detección de defectos hasta clasificación de productos.',
        },
        {
            icon: Cloud,
            title: 'Despliegue Flexible',
            subtitle: 'Edge, cloud o on-premise',
            description: 'Desplegamos tu modelo donde lo necesites: en servidores cloud, dispositivos edge (NVIDIA Jetson, Raspberry Pi) o en tu infraestructura.',
        },
        {
            icon: Code,
            title: 'Integración API',
            subtitle: 'Conecta con tus sistemas',
            description: 'API REST simple para integrar visión artificial en tu ERP, MES, WMS o cualquier sistema existente. SDKs para Python, JavaScript y más.',
        },
        {
            icon: BarChart3,
            title: 'Monitoreo Continuo',
            subtitle: 'Reentrenamiento y mejora',
            description: 'Monitoreamos el rendimiento del modelo en producción y lo reentrenamos automáticamente cuando detectamos drift o nuevos patrones.',
        },
    ];

    const processSteps = [
        {
            number: 1,
            title: 'Diagnóstico',
            description: 'Analizamos tu problema, datos disponibles y objetivos de negocio.',
        },
        {
            number: 2,
            title: 'Entrenamiento',
            description: 'Desarrollamos y entrenamos el modelo con tus datos etiquetados.',
        },
        {
            number: 3,
            title: 'Despliegue',
            description: 'Integramos el modelo en tu infraestructura o cloud.',
        },
        {
            number: 4,
            title: 'Soporte',
            description: 'Monitoreo 24/7 y reentrenamiento continuo para máximo rendimiento.',
        },
    ];

    return (
        <div className="min-h-screen bg-white pt-20">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-[#202124] mb-4">
                    Soluciones de Visión Artificial
                </h1>
                <p className="text-lg md:text-xl text-[#5f6368] max-w-3xl mx-auto leading-relaxed">
                    Transformamos tus operaciones con modelos de IA personalizados.
                    Desde la recolección de datos hasta el despliegue y mantenimiento continuo.
                </p>
            </section>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-8 hover:shadow-lg transition-shadow"
                            >
                                <div className="w-14 h-14 bg-[#1a73e8] rounded-xl flex items-center justify-center mb-6">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#202124] mb-2">
                                    {service.title}
                                </h3>
                                <p className="text-sm font-medium text-[#1a73e8] mb-4">
                                    {service.subtitle}
                                </p>
                                <p className="text-[#5f6368] leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Process Section */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#202124] text-center mb-12">
                    ¿Cómo Trabajamos?
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processSteps.map((step) => (
                        <div key={step.number} className="relative">
                            <div className="bg-white border-2 border-[#dadce0] rounded-xl p-6 hover:border-[#1a73e8] transition-colors">
                                <div className="w-12 h-12 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl font-bold text-[#1a73e8]">
                                        {step.number}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-[#202124] mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-sm text-[#5f6368] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                            {step.number < 4 && (
                                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#dadce0]" />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <ServiceCTA />
            </section>
        </div>
    );
}
