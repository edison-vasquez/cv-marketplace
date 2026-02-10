'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface ModelData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  technical: string;
  mAP: number;
  precision: number | null;
  inferenceMs: number | null;
  tags: string;
  modelFormat: string | null;
  onnxModelUrl: string | null;
  modelSizeBytes: number | null;
  labels: string | null;
  inputShape: string | null;
  isPremium: boolean;
  isPublic: boolean;
  apiAccessTier: string | null;
}

export default function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [modelId, setModelId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<ModelData | null>(null);

  useEffect(() => {
    params.then(p => {
      setModelId(p.id);
      fetchModel(p.id);
    });
  }, [params]);

  const fetchModel = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/models/${id}`);
      if (!res.ok) throw new Error('Modelo no encontrado');
      const data = await res.json();
      setFormData(data.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error guardando');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error eliminando modelo');

      router.push('/admin/models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-20">
        <p className="text-[#5f6368]">Modelo no encontrado</p>
        <Link href="/admin/models" className="text-[#1a73e8] hover:underline mt-2 inline-block">
          Volver a modelos
        </Link>
      </div>
    );
  }

  const categories = ['Seguridad', 'Calidad', 'Operacional', 'Salud', 'Retail', 'Infraestructura', 'Energia', 'Agricultura', 'Mineria', 'Manufactura'];
  const technicalTypes = ['Detection', 'Classification', 'Segmentation', 'Keypoint'];

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/models"
        className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Modelos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#202124]">Editar Modelo</h1>
          <p className="text-[#5f6368] mt-1">{formData.title}</p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-green-700">Modelo guardado correctamente</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Información Básica</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Tipo Técnico</label>
              <select
                value={formData.technical}
                onChange={(e) => setFormData({ ...formData, technical: e.target.value })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                {technicalTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Métricas</h2>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">mAP</label>
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
              <label className="block text-sm font-medium text-[#202124] mb-2">Precisión</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.precision || ''}
                onChange={(e) => setFormData({ ...formData, precision: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Inferencia (ms)</label>
              <input
                type="number"
                min="0"
                value={formData.inferenceMs || ''}
                onChange={(e) => setFormData({ ...formData, inferenceMs: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>
        </div>

        {/* Configuración ONNX */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Configuración de Inferencia Local</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Formato del Modelo</label>
              <select
                value={formData.modelFormat || ''}
                onChange={(e) => setFormData({ ...formData, modelFormat: e.target.value || null })}
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="">Sin modelo</option>
                <option value="onnx">ONNX</option>
                <option value="tfjs">TensorFlow.js</option>
                <option value="both">Ambos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">URL del Modelo ONNX</label>
              <input
                type="text"
                value={formData.onnxModelUrl || ''}
                onChange={(e) => setFormData({ ...formData, onnxModelUrl: e.target.value || null })}
                placeholder="/models/slug/model.onnx"
                className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202124] mb-2">Labels (JSON array)</label>
            <input
              type="text"
              value={formData.labels || ''}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value || null })}
              placeholder='["class1", "class2", "class3"]'
              className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a73e8]"
            />
          </div>
        </div>

        {/* Estado y Premium */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">Estado y Acceso</h2>

          <div className="flex items-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
              />
              <span className="text-sm text-[#202124]">Modelo Público</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="w-4 h-4 rounded border-[#dadce0] text-[#1a73e8] focus:ring-[#1a73e8]"
              />
              <span className="text-sm text-[#202124]">Modelo Premium</span>
            </label>
          </div>

          {formData.isPremium && (
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-2">Tier de Acceso API</label>
              <select
                value={formData.apiAccessTier || 'basic'}
                onChange={(e) => setFormData({ ...formData, apiAccessTier: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/models"
            className="px-6 py-3 text-[#5f6368] hover:text-[#202124] text-sm font-medium"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-[#202124] mb-2">¿Eliminar modelo?</h3>
            <p className="text-[#5f6368] mb-6">
              Esta acción no se puede deshacer. El modelo "{formData.title}" será eliminado permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
