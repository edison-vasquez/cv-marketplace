import { ArrowLeft, Clock, Cpu, Box, Tag, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import InferenceWidget from '@/components/model/InferenceWidget'
import HardwareCheck from '@/components/model/HardwareCheck'
import DeploymentGenerator from '@/components/model/DeploymentGenerator'

// Helper para parsear JSON de forma segura
function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

// Función para generar casos de uso basados en las labels
function generateUseCases(technical: string, labels: string[], category: string): string[] {
  const useCases: string[] = []

  if (technical === 'Detection') {
    if (labels.includes('face')) {
      useCases.push('Control de acceso y verificación de identidad')
      useCases.push('Análisis de emociones y expresiones faciales')
      useCases.push('Conteo de personas en espacios públicos')
    }
    if (labels.includes('person')) {
      useCases.push('Monitoreo de seguridad y vigilancia')
      useCases.push('Conteo de personas en tiendas o eventos')
      useCases.push('Detección de intrusos en zonas restringidas')
    }
    if (labels.includes('car') || labels.includes('bus') || labels.includes('motorbike')) {
      useCases.push('Monitoreo de tráfico vehicular')
      useCases.push('Conteo de vehículos en estacionamientos')
      useCases.push('Detección de infracciones de tránsito')
    }
    if (labels.includes('dog') || labels.includes('cat') || labels.includes('bird')) {
      useCases.push('Identificación de fauna silvestre')
      useCases.push('Monitoreo de mascotas')
      useCases.push('Trampas de cámara para vida silvestre')
    }
    if (labels.includes('bottle') || labels.includes('chair') || labels.includes('tvmonitor')) {
      useCases.push('Inventario automático de productos')
      useCases.push('Detección de objetos en retail')
      useCases.push('Automatización de almacenes')
    }
  } else if (technical === 'Classification') {
    useCases.push('Clasificación automática de imágenes')
    useCases.push('Organización de bibliotecas de fotos')
    useCases.push('Control de calidad visual')
    if (category.toLowerCase().includes('food') || category.toLowerCase().includes('agriculture')) {
      useCases.push('Inspección de calidad de alimentos')
      useCases.push('Clasificación de productos agrícolas')
    }
  }

  return useCases.length > 0 ? useCases : [
    'Procesamiento de imágenes en tiempo real',
    'Automatización de tareas visuales',
    'Integración con sistemas IoT'
  ]
}

// Función para generar limitaciones basadas en el modelo
function generateLimitations(technical: string, labels: string[], modelUrl: string | null): string[] {
  const limitations: string[] = []

  if (modelUrl?.includes('tiny-yolov2')) {
    limitations.push('Solo detecta las 20 clases de Pascal VOC')
    limitations.push('Menor precisión que modelos más grandes (YOLOv8)')
    limitations.push('No detecta objetos muy pequeños')
  } else if (modelUrl?.includes('yunet') || modelUrl?.includes('face-detection')) {
    limitations.push('Solo detecta caras, no identifica personas')
    limitations.push('Puede fallar con caras parcialmente ocultas')
    limitations.push('Requiere buena iluminación')
  } else if (modelUrl?.includes('ssd-mobilenet')) {
    limitations.push('Optimizado para velocidad sobre precisión')
    limitations.push('Puede tener falsos positivos en escenas complejas')
  } else if (modelUrl?.includes('mobilenet') || modelUrl?.includes('shufflenet') || modelUrl?.includes('resnet')) {
    limitations.push('Solo clasifica una categoría principal por imagen')
    limitations.push('Requiere que el objeto ocupe la mayor parte de la imagen')
    limitations.push('Basado en ImageNet (1000 categorías genéricas)')
  } else if (modelUrl?.includes('efficientnet')) {
    limitations.push('Mayor precisión pero más lento que MobileNet')
    limitations.push('Requiere más memoria del navegador')
  }

  // Limitaciones generales
  limitations.push('Rendimiento depende del hardware del navegador')

  return limitations
}

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

    // Parse JSON fields safely
    const parseTags = (tags: unknown): string[] => {
      if (Array.isArray(tags)) return tags
      if (typeof tags === 'string') {
        try {
          return JSON.parse(tags)
        } catch {
          return []
        }
      }
      return []
    }

    // Keep JSON fields as strings for the component
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
      roboflowId: model.roboflow_id || model.roboflowId,
      tags: parseTags(model.tags),
      modelMetadata: {
        id: model.id,
        title: model.title,
        format: (model.model_format || model.modelFormat || 'onnx') as 'onnx' | 'tfjs' | 'both' | null,
        onnxModelUrl: model.onnx_model_url || model.onnxModelUrl || null,
        tfjsModelUrl: model.tfjs_model_url || model.tfjsModelUrl || null,
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

  const technicalColors: Record<string, string> = {
    Detection: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Segmentation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Classification: 'bg-green-500/10 text-green-400 border-green-500/20',
    Keypoint: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-12 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${technicalColors[model.technical] || technicalColors.Detection}`}>
                {model.technical}
              </span>
              <span className="text-[#dadce0]">•</span>
              <span className="text-[#5f6368] text-sm font-medium">v{model.version}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#202124] tracking-tight">
              {model.title}
            </h1>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center overflow-hidden">
                  <span className="text-white text-xs font-bold">
                    {model.creator.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#202124]">{model.creator}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5f6368] text-sm">
                <Clock className="w-4 h-4" />
                {model.category}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-xl p-6">
              <p className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1">mAP</p>
              <p className="text-3xl font-bold text-[#202124]">{(model.mAP * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-1">Precisión</p>
              <p className="text-3xl font-bold text-[#202124]">
                {model.precision ? `${(model.precision * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-6">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-1">Inferencia</p>
              <p className="text-3xl font-bold text-[#202124]">
                {model.inferenceMs ? `${model.inferenceMs}ms` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#202124]">Descripción</h2>
            <p className="text-lg text-[#5f6368] leading-relaxed">
              {model.description || `Un modelo de ${model.technical.toLowerCase()} para aplicaciones de ${model.category.toLowerCase()}.`}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {model.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#f1f3f4] text-[#5f6368] rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Qué Detecta/Clasifica - NUEVA SECCIÓN */}
          {(() => {
            const labels = safeJsonParse<string[]>(model.modelMetadata.labels, [])
            const inputShape = safeJsonParse<{width?: number, height?: number}>(model.modelMetadata.inputShape, {})

            return labels.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
                  <Tag className="w-6 h-6 text-[#1a73e8]" />
                  {model.technical === 'Detection' ? '¿Qué Detecta?' : '¿Qué Clasifica?'}
                </h2>
                <p className="text-[#5f6368]">
                  Este modelo puede {model.technical === 'Detection' ? 'detectar' : 'clasificar'} {labels.length} {labels.length === 1 ? 'clase' : 'clases diferentes'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {labels.slice(0, 30).map((label: string) => (
                    <span
                      key={label}
                      className="px-3 py-1.5 bg-[#e8f0fe] text-[#1a73e8] rounded-lg text-sm font-medium border border-[#1a73e8]/20"
                    >
                      {label}
                    </span>
                  ))}
                  {labels.length > 30 && (
                    <span className="px-3 py-1.5 bg-[#f1f3f4] text-[#5f6368] rounded-lg text-sm">
                      +{labels.length - 30} más
                    </span>
                  )}
                </div>
              </div>
            ) : null
          })()}

          {/* Especificaciones Técnicas - NUEVA SECCIÓN */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
              <Cpu className="w-6 h-6 text-[#1a73e8]" />
              Especificaciones Técnicas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const inputShape = safeJsonParse<{width?: number, height?: number, channels?: number}>(model.modelMetadata.inputShape, {})
                const modelSize = model.modelMetadata.modelSizeBytes
                const preprocessing = safeJsonParse<{mean?: number[], std?: number[]}>(model.modelMetadata.preprocessing, {})

                return (
                  <>
                    <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#5f6368] uppercase tracking-widest mb-1">Formato</p>
                      <p className="text-lg font-semibold text-[#202124]">
                        {model.modelMetadata.format?.toUpperCase() || 'ONNX'}
                      </p>
                    </div>
                    <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#5f6368] uppercase tracking-widest mb-1">Tamaño de Entrada</p>
                      <p className="text-lg font-semibold text-[#202124]">
                        {inputShape.width && inputShape.height
                          ? `${inputShape.width}×${inputShape.height}px`
                          : 'Variable'}
                      </p>
                    </div>
                    <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#5f6368] uppercase tracking-widest mb-1">Tamaño del Modelo</p>
                      <p className="text-lg font-semibold text-[#202124]">
                        {modelSize
                          ? `${(modelSize / 1024 / 1024).toFixed(1)} MB`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
                      <p className="text-xs font-bold text-[#5f6368] uppercase tracking-widest mb-1">Normalización</p>
                      <p className="text-lg font-semibold text-[#202124]">
                        {preprocessing.mean ? 'ImageNet' : 'Standard (0-1)'}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Casos de Uso - NUEVA SECCIÓN */}
          {(() => {
            const labels = safeJsonParse<string[]>(model.modelMetadata.labels, [])
            const useCases = generateUseCases(model.technical, labels, model.category)

            return (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#34a853]" />
                  Casos de Uso
                </h2>
                <div className="grid gap-3">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-[#e6f4ea] border border-[#34a853]/20 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-[#34a853] flex-shrink-0 mt-0.5" />
                      <span className="text-[#202124]">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Limitaciones - NUEVA SECCIÓN */}
          {(() => {
            const labels = safeJsonParse<string[]>(model.modelMetadata.labels, [])
            const limitations = generateLimitations(model.technical, labels, model.modelMetadata.onnxModelUrl)

            return (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-[#ea4335]" />
                  Limitaciones
                </h2>
                <div className="grid gap-3">
                  {limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-[#fce8e6] border border-[#ea4335]/20 rounded-xl">
                      <Box className="w-5 h-5 text-[#ea4335] flex-shrink-0 mt-0.5" />
                      <span className="text-[#202124]">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Cómo Aplicar - NUEVA SECCIÓN */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
              <Box className="w-6 h-6 text-[#1a73e8]" />
              Cómo Aplicar Este Modelo
            </h2>
            <div className="space-y-4 text-[#5f6368]">
              <div className="p-4 bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-xl">
                <h3 className="font-bold text-[#202124] mb-2">1. Prueba en el Navegador</h3>
                <p>Usa el widget de inferencia a la derecha para probar el modelo directamente sin instalar nada. {model.technical === 'Detection' ? 'Activa la cámara para detección en tiempo real.' : 'Sube una imagen para clasificarla.'}</p>
              </div>
              <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl">
                <h3 className="font-bold text-[#202124] mb-2">2. Descarga para Uso Local</h3>
                <p>El modelo se ejecuta 100% en tu navegador usando ONNX Runtime Web. No se envían datos a ningún servidor.</p>
              </div>
              <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl">
                <h3 className="font-bold text-[#202124] mb-2">3. Integra en tu Aplicación</h3>
                <p>Usa el código de ejemplo abajo para integrar este modelo en tu propia aplicación web o backend.</p>
              </div>
            </div>
          </div>

          {/* Integración */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#202124]">Código de Integración</h2>
            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl overflow-hidden">
              <div className="flex border-b border-[#dadce0]">
                <button className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-[#1a73e8] text-[#1a73e8] bg-white">
                  JavaScript (ONNX)
                </button>
                <button className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#5f6368] hover:bg-white/50 transition-colors">
                  Python
                </button>
              </div>
              <pre className="p-6 text-sm font-mono text-[#202124] overflow-x-auto bg-white">
                <code>{`import * as ort from 'onnxruntime-web';

// Cargar el modelo
const session = await ort.InferenceSession.create(
  '${model.modelMetadata.onnxModelUrl || `https://models.visionhub.com/${model.slug}.onnx`}'
);

// Preparar imagen (ejemplo: ${(() => {
  const shape = safeJsonParse<{width?: number, height?: number}>(model.modelMetadata.inputShape, {})
  return shape.width ? `${shape.width}x${shape.height}` : '640x640'
})()}px)
const tensor = new ort.Tensor('float32', imageData, [1, 3, ${(() => {
  const shape = safeJsonParse<{width?: number, height?: number}>(model.modelMetadata.inputShape, {})
  return shape.height || 640
})()}, ${(() => {
  const shape = safeJsonParse<{width?: number, height?: number}>(model.modelMetadata.inputShape, {})
  return shape.width || 640
})()}]);

// Ejecutar inferencia
const results = await session.run({ images: tensor });

// Procesar resultados
${model.technical === 'Detection'
  ? `const boxes = results.boxes.data; // [x, y, w, h, score, class]
boxes.forEach(box => {
  console.log(\`Detectado: \${labels[box.class]} (\${box.score}%)\`);
});`
  : `const scores = results.output.data;
const topClass = Math.max(...scores);
console.log(\`Clasificado como: \${labels[topClass]}\`);`}`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          <InferenceWidget
            modelId={model.id}
            modelMetadata={model.modelMetadata}
          />
          <HardwareCheck />
          <DeploymentGenerator modelId={model.slug} modelName={model.title} />
        </div>
      </div>
    </div>
  )
}
