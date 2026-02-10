import { prisma } from '@/lib/db';
import { Key, Users, TrendingUp, AlertCircle } from 'lucide-react';

async function getApiKeysStats() {
  const apiKeys = await prisma.apiKey.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter(k => k.isActive).length,
    totalRequests: apiKeys.reduce((sum, k) => sum + k.requestCount, 0),
    byTier: {
      free: apiKeys.filter(k => k.tier === 'free').length,
      basic: apiKeys.filter(k => k.tier === 'basic').length,
      pro: apiKeys.filter(k => k.tier === 'pro').length,
    },
  };

  return { apiKeys, stats };
}

export default async function AdminApiKeysPage() {
  const { apiKeys, stats } = await getApiKeysStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#202124]">API Keys</h1>
        <p className="text-[#5f6368] mt-1">Monitorea el uso de API Keys del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#202124]">{stats.total}</p>
              <p className="text-xs text-[#5f6368]">Total Keys</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#202124]">{stats.active}</p>
              <p className="text-xs text-[#5f6368]">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#202124]">{stats.totalRequests.toLocaleString()}</p>
              <p className="text-xs text-[#5f6368]">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#5f6368] font-medium">Por Tier</p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                Free: {stats.byTier.free}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                Basic: {stats.byTier.basic}
              </span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded text-xs">
                Pro: {stats.byTier.pro}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dadce0]">
          <h2 className="font-bold text-[#202124]">Todas las API Keys</h2>
        </div>
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Nombre
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Usuario
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Uso
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-6 py-3 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Último Uso
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Key className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
                  <p className="text-[#5f6368]">No hay API Keys generadas</p>
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => {
                const usagePercent = (key.requestCount / key.requestLimit) * 100;
                const isNearLimit = usagePercent > 80;

                return (
                  <tr key={key.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#5f6368]" />
                        <span className="font-medium text-[#202124]">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-[#202124]">{key.user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-[#5f6368]">{key.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        key.tier === 'pro' ? 'bg-yellow-100 text-yellow-700' :
                        key.tier === 'basic' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {key.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isNearLimit ? 'text-orange-600' : 'text-[#5f6368]'}>
                            {key.requestCount.toLocaleString()} / {key.requestLimit.toLocaleString()}
                          </span>
                          {isNearLimit && <AlertCircle className="w-3 h-3 text-orange-500" />}
                        </div>
                        <div className="h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent > 90 ? 'bg-red-500' :
                              usagePercent > 80 ? 'bg-orange-500' :
                              'bg-[#1a73e8]'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {key.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Revocada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5f6368]">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleString('es-ES')
                        : 'Nunca'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
