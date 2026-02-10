import Link from 'next/link';
import { ArrowUpRight, BarChart3, Cpu, Cloud, Zap } from 'lucide-react';

interface ModelCardProps {
    id: string;
    title: string;
    creator: string;
    category: string;
    mAP: number;
    image: string;
    tags: string[];
    // Nuevos campos para inferencia local
    modelFormat?: string | null;
    onnxModelUrl?: string | null;
    modelSizeBytes?: number | null;
    isPremium?: boolean;
    technical?: string;
}

export default function ModelCard({
    id, title, creator, category, mAP, image, tags,
    modelFormat, onnxModelUrl, modelSizeBytes, isPremium, technical
}: ModelCardProps) {
    // Determinar si el modelo soporta inferencia local
    const supportsLocalInference = !!(modelFormat && onnxModelUrl);

    // Formatear tamaño del modelo
    const formatSize = (bytes?: number | null) => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <Link
            href={`/models/${id}`}
            className="bg-white border border-[#dadce0] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 block text-current no-underline group"
        >
            <div className="relative h-40 w-full overflow-hidden bg-[#f8f9fa]">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-[#1a73e8] rounded-full text-white">
                        {category}
                    </span>
                    {technical && (
                        <span className="px-2 py-1 text-xs font-medium bg-white/90 text-[#5f6368] rounded-full">
                            {technical}
                        </span>
                    )}
                </div>
                {/* Indicador de inferencia local */}
                <div className="absolute top-3 right-3">
                    {supportsLocalInference ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full flex items-center gap-1" title="Ejecutar en navegador">
                            <Cpu className="w-3 h-3" />
                            Local
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-[#5f6368] text-white rounded-full flex items-center gap-1" title="Requiere API">
                            <Cloud className="w-3 h-3" />
                            API
                        </span>
                    )}
                </div>
                {/* Badge Premium */}
                {isPremium && (
                    <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Premium
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors truncate">
                            {title}
                        </h3>
                        <p className="text-xs text-[#5f6368] mt-0.5">
                            by {creator}
                        </p>
                    </div>
                    <div className="text-right ml-2">
                        <div className="flex items-center gap-1 text-[#1a73e8] text-sm font-medium">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>{(mAP * 100).toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] text-[#80868b]">mAP</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-[#f1f3f4] rounded text-xs text-[#5f6368]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#e8eaed]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#1a73e8] text-sm font-medium group-hover:underline">
                            Probar Modelo
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        {modelSizeBytes && supportsLocalInference && (
                            <span className="text-xs text-[#5f6368]">
                                {formatSize(modelSizeBytes)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
