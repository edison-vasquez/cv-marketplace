import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Box, Plus, Search, Filter, MoreVertical, Download, Trash2, Edit, Eye } from 'lucide-react';

async function getModels() {
  const models = await prisma.model.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      technical: true,
      mAP: true,
      modelFormat: true,
      onnxModelUrl: true,
      modelSizeBytes: true,
      isPublic: true,
      isPremium: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return models;
}

export default async function AdminModelsPage() {
  const models = await getModels();

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#202124]">Modelos</h1>
          <p className="text-[#5f6368] mt-1">Gestiona los modelos de visión por computadora</p>
        </div>
        <Link
          href="/admin/models/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg text-sm font-medium hover:bg-[#1557b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Modelo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5f6368]" />
          <input
            type="text"
            placeholder="Buscar modelos..."
            className="w-full pl-10 pr-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#dadce0] rounded-lg text-sm text-[#5f6368] hover:bg-[#f1f3f4] transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <p className="text-2xl font-bold text-[#202124]">{models.length}</p>
          <p className="text-sm text-[#5f6368]">Total Modelos</p>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">
            {models.filter(m => m.modelFormat === 'onnx').length}
          </p>
          <p className="text-sm text-[#5f6368]">Con ONNX</p>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-600">
            {models.filter(m => m.isPublic).length}
          </p>
          <p className="text-sm text-[#5f6368]">Públicos</p>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-600">
            {models.filter(m => m.isPremium).length}
          </p>
          <p className="text-sm text-[#5f6368]">Premium</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Modelo
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Formato
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Tamaño
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                mAP
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Estado
              </th>
              <th className="text-right px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {models.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Box className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
                  <p className="text-[#5f6368]">No hay modelos todavía</p>
                  <Link
                    href="/admin/models/new"
                    className="text-[#1a73e8] hover:underline text-sm mt-2 inline-block"
                  >
                    Subir el primer modelo
                  </Link>
                </td>
              </tr>
            ) : (
              models.map((model) => (
                <tr key={model.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#e8f0fe] rounded-lg flex items-center justify-center">
                        <Box className="w-5 h-5 text-[#1a73e8]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#202124]">{model.title}</p>
                        <p className="text-xs text-[#5f6368]">{model.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#5f6368]">{model.category}</span>
                    <span className="block text-xs text-[#9aa0a6]">{model.technical}</span>
                  </td>
                  <td className="px-6 py-4">
                    {model.modelFormat ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {model.modelFormat.toUpperCase()}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        Sin modelo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {formatSize(model.modelSizeBytes)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#202124]">
                      {(model.mAP * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {model.isPublic ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Público
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                          Borrador
                        </span>
                      )}
                      {model.isPremium && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/models/${model.slug}`}
                        className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/models/${model.id}/edit`}
                        className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-[#5f6368] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
