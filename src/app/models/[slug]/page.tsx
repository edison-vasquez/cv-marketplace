import { ArrowLeft, Clock, Zap, Cpu, Cloud } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import InferenceWidget from '@/components/model/InferenceWidget'
import ServiceCTA from '@/components/shared/ServiceCTA'

interface PageProps {
  params: Promise<{ slug: string }>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

async function getModel(slug: string) {
  try {
    const response = await fetch(`${API_URL}/api/models/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return null
    }

    const model = await response.json()

    const toStringOrNull = (value: unknown): string | null => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') return value
      return JSON.stringify(value)
    }

    return {
      id: model.id,
      title: model.title,
      slug: model.slug,
      description: model.description,
      creator: model.creator,
      category: model.category,
      technical: model.technical,
      mAP: model.mAP || model.map,
      precision: model.precision,
      inferenceMs: model.inference_ms || model.inferenceMs,
      version: model.version || '1.0.0',
      modelMetadata: {
        id: model.id,
        title: model.title,
        format: (model.model_format || model.modelFormat || 'onnx') as 'onnx' | 'tfjs' | 'both' | null,
        onnxModelUrl: model.onnx_model_url || model.onnxModelUrl || null,
        tfjsModelUrl: model.tfjs_model_url || model.tfjsModelUrl || null,
        roboflowId: model.roboflow_id || model.roboflowId || null,
        roboflowVersion: model.roboflow_version || model.roboflowVersion || null,
        roboflowModelType: model.roboflow_model_type || model.roboflowModelType || null,
        modelSizeBytes: model.model_size_bytes || model.modelSizeBytes || null,
        inputShape: toStringOrNull(model.input_shape || model.inputShape),
        labels: toStringOrNull(model.labels),
        preprocessing: toStringOrNull(model.preprocessing),
        postprocessing: toStringOrNull(model.postprocessing),
        technical: model.technical,
        isPremium: model.is_premium === 1 || model.isPremium,
      },
    }
  } catch (error) {
    console.error('Error fetching model:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const model = await getModel(slug)

  if (!model) {
    return { title: 'Modelo No Encontrado | VisionHub' }
  }

  return {
    title: `${model.title} | VisionHub`,
    description: model.description || `${model.title} - ${model.technical} model for ${model.category}`,
  }
}

export default async function ModelPage({ params }: PageProps) {
  const { slug } = await params
  const model = await getModel(slug)

  if (!model) {
    notFound()
  }

  // Detect if this is a generic/customizable model
  const labelsRaw = model.modelMetadata?.labels;
  const isGeneric = labelsRaw === '["__custom__"]' || labelsRaw === '__custom__';

  const technicalColors: Record<string, string> = {
    Detection: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Segmentation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Classification: 'bg-green-500/10 text-green-400 border-green-500/20',
    Keypoint: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header Band - Full Width */}
      <div className="space-y-6 mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Marketplace
        </Link>

        {/* Badges Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${technicalColors[model.technical] || technicalColors.Detection}`}>
            {model.technical}
          </span>
          {model.modelMetadata.onnxModelUrl || model.modelMetadata.tfjsModelUrl ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
              <Cpu className="w-2.5 h-2.5" />
              Local
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">
              <Cloud className="w-2.5 h-2.5" />
              API
            </span>
          )}
          {model.modelMetadata.isPremium && (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500 shadow-sm">
              <Zap className="w-2.5 h-2.5 fill-current" />
              Premium
            </span>
          )}
          <span className="text-[#dadce0]">•</span>
          <span className="text-[#5f6368] text-sm font-medium">v{model.version}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#202124] tracking-tight">
          {model.title}
        </h1>

        {/* Creator Info & Category */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {model.creator.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-[#202124]">{model.creator}</span>
          </div>
          <div className="flex items-center gap-1 text-[#5f6368]">
            <Clock className="w-4 h-4" />
            {model.category}
          </div>
        </div>
      </div>

      {/* InferenceWidget - Hero Section */}
      <section id="probar" className="mb-12 max-w-3xl mx-auto">
        <InferenceWidget
          modelId={model.id}
          modelMetadata={model.modelMetadata}
          isGeneric={isGeneric}
        />
      </section>

      {/* Content Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-10">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1">mAP</p>
              <p className="text-2xl font-bold text-[#202124]">{(model.mAP * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-1">Precisión</p>
              <p className="text-2xl font-bold text-[#202124]">
                {model.precision ? `${(model.precision * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-1">Inferencia</p>
              <p className="text-2xl font-bold text-[#202124]">
                {model.inferenceMs ? `${model.inferenceMs}ms` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <section id="description" className="space-y-4">
            <h2 className="text-xl font-bold text-[#202124]">Descripción</h2>
            <p className="text-[#5f6368] leading-relaxed">
              {model.description || `Modelo avanzado de ${model.technical.toLowerCase()} optimizado para entornos de ${model.category.toLowerCase()}.`}
            </p>
          </section>

          {/* Classes Section */}
          {model.modelMetadata.labels && (
            <section id="classes" className="space-y-4">
              <h2 className="text-xl font-bold text-[#202124]">¿Qué Clasifica?</h2>
              <p className="text-[#5f6368] text-sm">
                Este modelo puede identificar las siguientes {JSON.parse(model.modelMetadata.labels).length} categorías:
              </p>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(model.modelMetadata.labels).slice(0, 15).map((label: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-[#f1f3f4] text-[#5f6368] rounded-full text-xs font-medium border border-[#dadce0]">
                    {label}
                  </span>
                ))}
                {JSON.parse(model.modelMetadata.labels).length > 15 && (
                  <span className="px-3 py-1 bg-white text-[#1a73e8] rounded-full text-xs font-medium border border-[#1a73e8]/20">
                    + {JSON.parse(model.modelMetadata.labels).length - 15} más
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Use Cases & Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#202124]">Casos de Uso</h2>
              <ul className="space-y-2 text-[#5f6368] text-sm">
                <li className="flex gap-2">
                  <span className="text-[#1a73e8]">•</span>
                  Análisis preliminar en {model.category.toLowerCase()}
                </li>
                <li className="flex gap-2">
                  <span className="text-[#1a73e8]">•</span>
                  Sistemas de apoyo a la decisión
                </li>
                <li className="flex gap-2">
                  <span className="text-[#1a73e8]">•</span>
                  Procesamiento de datos a gran escala
                </li>
              </ul>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#202124]">Limitaciones</h2>
              <ul className="space-y-2 text-[#5f6368] text-sm">
                <li className="flex gap-2">
                  <span className="text-red-500">•</span>
                  No sustituye el juicio de un experto humano
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">•</span>
                  Sensible a condiciones de iluminación
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technical Specs Card */}
          <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-[#202124]">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Formato</p>
                <p className="text-sm font-medium text-[#202124]">{model.modelMetadata.format?.toUpperCase() || 'ONNX'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Entrada</p>
                <p className="text-sm font-medium text-[#202124]">{model.modelMetadata.inputShape ? JSON.parse(model.modelMetadata.inputShape).width + 'x' + JSON.parse(model.modelMetadata.inputShape).height + 'px' : '224x224px'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Tamaño</p>
                <p className="text-sm font-medium text-[#202124]">{model.modelMetadata.modelSizeBytes ? (model.modelMetadata.modelSizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Normalización</p>
                <p className="text-sm font-medium text-[#202124]">ImageNet</p>
              </div>
            </div>
          </div>

          {/* API Access Card */}
          <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-[#202124]">Integración API</h3>
            <p className="text-sm text-[#5f6368]">
              Usa nuestra API para integrar {model.title} en tu aplicación backend.
            </p>
            <Link
              href={model.modelMetadata.isPremium ? "/pricing" : "/dashboard/api-keys"}
              className={`block w-full py-2 text-center text-sm font-medium rounded-lg border transition-colors ${model.modelMetadata.isPremium
                ? "bg-[#1a73e8] text-white border-[#1a73e8] hover:bg-[#185abc]"
                : "bg-[#f8f9fa] text-[#1a73e8] border-[#dadce0] hover:bg-[#e8f0fe]"
                }`}
            >
              {model.modelMetadata.isPremium ? "Actualizar a Pro" : "Generar API Key"}
            </Link>
          </div>

          {/* ServiceCTA Card */}
          <ServiceCTA variant="card" />

          {/* Code Snippet */}
          <section id="code" className="space-y-4">
            <h2 className="text-xl font-bold text-[#202124]">Código de Integración</h2>
            <div className="relative group">
              <pre className="bg-[#202124] text-[#e8eaed] p-6 rounded-xl overflow-x-auto text-xs leading-relaxed font-mono">
                {model.modelMetadata.format === 'tfjs'
                  ? `import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Cargar el modelo
const model = await cocoSsd.load();

// Ejecutar inferencia
const predictions = await model.detect(imageElement);
console.log('Predicciones:', predictions);`
                  : `import * as ort from 'onnxruntime-web';

// Cargar el modelo
const session = await ort.InferenceSession.create(
  '${API_URL}/models/${model.slug}.onnx'
);

// Preparar imagen
const tensor = new ort.Tensor('float32', imageData, [1, 3, 224, 224]);

// Ejecutar inferencia
const results = await session.run({ images: tensor });
const scores = results.output.data;
const topClass = Math.max(...scores);`}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
