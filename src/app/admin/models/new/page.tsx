'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileCode, Tag, AlertCircle, Loader2, CheckCircle, Info } from 'lucide-react';

interface FormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  technical: string;
  mAP: number;
  precision: number;
  inferenceMs: number;
  tags: string;
  inputWidth: number;
  inputHeight: number;
  isPremium: boolean;
  isPublic: boolean;
}

export default function NewModelPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    category: 'industrial',
    technical: 'Detection',
    mAP: 0.85,
    precision: 0.90,
    inferenceMs: 25,
    tags: '',
    inputWidth: 640,
    inputHeight: 640,
    isPremium: false,
    isPublic: false,
  });

  const [modelFile, setModelFile] = useState<File | null>(null);
  const [labelsFile, setLabelsFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generar slug desde título
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, title, slug });
  };

  // Manejar drag & drop para archivos
  const handleFileDrop = useCallback((e: React.DragEvent, type: 'model' | 'labels' | 'image') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    switch (type) {
      case 'model':
        if (file.name.endsWith('.onnx')) {
          setModelFile(file);
        } else {
          setError('Solo se aceptan archivos .onnx');
        }
        break;
      case 'labels':
        if (file.name.endsWith('.json')) {
          setLabelsFile(file);
        } else {
          setError('Solo se aceptan archivos .json para las etiquetas');
        }
        break;
      case 'image':
        if (file.type.startsWith('image/')) {
          setImageFile(file);
        } else {
          setError('Solo se aceptan archivos de imagen');
        }
        break;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validaciones
      if (!formData.title) throw new Error('El título es requerido');
      if (!formData.slug) throw new Error('El slug es requerido');

      // Crear FormData para envío
      const submitData = new FormData();
      submitData.append('metadata', JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        inputShape: {
          width: formData.inputWidth,
          height: formData.inputHeight,
          channels: 3,
        },
      }));

      if (modelFile) {
        submitData.append('model', modelFile);
      }
      if (labelsFile) {
        submitData.append('labels', labelsFile);
      }
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Simular progreso (en producción usar XMLHttpRequest con progress event)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch('/api/admin/models', {
        method: 'POST',
        body: submitData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear el modelo');
      }

      const { model } = await res.json();
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/admin/models/${model.id}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { value: 'industrial', label: 'Industrial' },
    { value: 'healthcare', label: 'Salud' },
    { value: 'security', label: 'Seguridad' },
    { value: 'retail', label: 'Retail' },
    { value: 'agriculture', label: 'Agricultura' },
    { value: 'automotive', label: 'Automotriz' },
    { value: 'other', label: 'Otro' },
  ];

  const technicalTypes = [
    { value: 'Detection', label: 'Detección de Objetos' },
    { value: 'Classification', label: 'Clasificación' },
    { value: 'Segmentation', label: 'Segmentación' },
    { value: 'Keypoint', label: 'Detección de Keypoints' },
  ];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#202124] mb-2">Modelo Creado</h1>
        <p className="text-[#5f6368]">Redirigiendo al panel del modelo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/models"
        className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Modelos
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#202124]">Nuevo Modelo</h1>
        <p className="text-[#5f6368] mt-1">Sube un modelo ONNX para inferencia local en navegador</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Información Básica</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Título del Modelo *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="ej: YOLOv8 Detector de Cascos"
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="yolov8-detector-cascos"
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las capacidades y uso del modelo..."
              rows={3}
              className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Tipo Técnico
              </label>
              <select
                value={formData.technical}
                onChange={(e) => setFormData({ ...formData, technical: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                {technicalTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ej: seguridad, construcción, PPE, YOLO"
              className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
            />
          </div>
        </div>

        {/* Archivos del Modelo */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Archivos del Modelo</h2>

          {/* Archivo ONNX */}
          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">
              <FileCode className="w-4 h-4 inline mr-1" />
              Archivo ONNX
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, 'model')}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                modelFile ? 'border-green-500 bg-green-50' : 'border-[#dadce0] hover:border-[#1a73e8]'
              }`}
            >
              {modelFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-[#202124]">{modelFile.name}</span>
                  <span className="text-sm text-[#5f6368]">
                    ({(modelFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setModelFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#5f6368] mx-auto mb-2" />
                  <p className="text-[#5f6368]">Arrastra tu archivo .onnx aquí o</p>
                  <label className="cursor-pointer">
                    <span className="text-[#1a73e8] hover:underline">selecciona un archivo</span>
                    <input
                      type="file"
                      accept=".onnx"
                      onChange={(e) => e.target.files && setModelFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Archivo Labels */}
          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">
              Archivo de Etiquetas (labels.json)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, 'labels')}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                labelsFile ? 'border-green-500 bg-green-50' : 'border-[#dadce0] hover:border-[#1a73e8]'
              }`}
            >
              {labelsFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-[#202124]">{labelsFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setLabelsFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <span className="text-[#5f6368]">Arrastra labels.json o </span>
                  <span className="text-[#1a73e8] hover:underline">selecciona</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files && setLabelsFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-[#5f6368] mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Formato: {`["clase1", "clase2", "clase3"]`}
            </p>
          </div>

          {/* Imagen de preview */}
          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">
              Imagen de Preview
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, 'image')}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                imageFile ? 'border-green-500 bg-green-50' : 'border-[#dadce0] hover:border-[#1a73e8]'
              }`}
            >
              {imageFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-[#202124]">{imageFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <span className="text-[#5f6368]">Arrastra una imagen o </span>
                  <span className="text-[#1a73e8] hover:underline">selecciona</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Métricas y Configuración */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Métricas y Configuración</h2>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                mAP (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.mAP}
                onChange={(e) => setFormData({ ...formData, mAP: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Precisión (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.precision}
                onChange={(e) => setFormData({ ...formData, precision: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Tiempo Inferencia (ms)
              </label>
              <input
                type="number"
                min="0"
                value={formData.inferenceMs}
                onChange={(e) => setFormData({ ...formData, inferenceMs: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Ancho de Entrada (px)
              </label>
              <input
                type="number"
                min="32"
                value={formData.inputWidth}
                onChange={(e) => setFormData({ ...formData, inputWidth: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">
                Alto de Entrada (px)
              </label>
              <input
                type="number"
                min="32"
                value={formData.inputHeight}
                onChange={(e) => setFormData({ ...formData, inputHeight: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
              />
              <span className="text-sm text-[#202124]">Publicar inmediatamente</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
              />
              <span className="text-sm text-[#202124]">Modelo Premium (API de pago)</span>
            </label>
          </div>
        </div>

        {/* Botón Submit */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/models"
            className="px-6 py-3 text-[#5f6368] hover:text-[#202124] text-sm font-medium"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={uploading}
            className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Crear Modelo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
