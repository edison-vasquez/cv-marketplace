'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  tier: string;
  requestCount: number;
  requestLimit: number;
  lastUsedAt: string | null;
  createdAt: string;
  isActive: boolean;
}

export default function UserApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState('free');
  const [creating, setCreating] = useState(false);

  // Key recién creada
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/premium/api-keys');
      if (!res.ok) throw new Error('Error cargando API keys');
      const data = await res.json();
      setApiKeys(data.apiKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/premium/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, tier: newKeyTier }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error creando API key');
      }

      const data = await res.json();
      setNewlyCreatedKey(data.apiKey.key);
      setShowCreateModal(false);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCreating(false);
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm('¿Estás seguro de revocar esta API key? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/premium/api-keys?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error revocando API key');

      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">API Keys</h1>
          <p className="text-[#5f6368] mt-1">Gestiona tus claves de acceso a la API</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva API Key
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Nueva key creada */}
      {newlyCreatedKey && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-green-800">API Key creada exitosamente</p>
              <p className="text-sm text-green-600 mt-1">
                Copia esta key ahora. Por seguridad, no se mostrará de nuevo.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-mono">
                  {showKey ? newlyCreatedKey : '•'.repeat(40)}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Nombre
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Uso
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Último Uso
              </th>
              <th className="text-right px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Key className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
                  <p className="text-[#5f6368]">No tienes API keys</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-[#1a73e8] hover:underline text-sm mt-2"
                  >
                    Crear tu primera API key
                  </button>
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => {
                const usagePercent = (key.requestCount / key.requestLimit) * 100;

                return (
                  <tr key={key.id} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-[#5f6368]" />
                        <div>
                          <p className="font-medium text-[#202124]">{key.name}</p>
                          <p className="text-xs text-[#5f6368]">
                            Creada {new Date(key.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
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
                        <p className="text-sm text-[#202124]">
                          {key.requestCount.toLocaleString()} / {key.requestLimit.toLocaleString()}
                        </p>
                        <div className="h-1.5 w-32 bg-[#e8eaed] rounded-full overflow-hidden">
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
                    <td className="px-6 py-4 text-sm text-[#5f6368]">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleString('es-ES')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Revocar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Documentación */}
      <div className="bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-xl p-6">
        <h3 className="font-bold text-[#202124] mb-3">Cómo usar la API</h3>
        <p className="text-sm text-[#5f6368] mb-4">
          Incluye tu API key en el header de cada request:
        </p>
        <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
          <code>{`curl -X POST https://visionhub.com/api/premium/inference \\
  -H "X-API-Key: tu_api_key_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "base64...", "modelId": "safety-helmet-detection"}'`}</code>
        </pre>
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-[#202124] mb-4">Nueva API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="ej: Producción, Testing, Mi App"
                  className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#202124] mb-2">
                  Tier
                </label>
                <select
                  value={newKeyTier}
                  onChange={(e) => setNewKeyTier(e.target.value)}
                  className="w-full px-4 py-2 border border-[#dadce0] rounded-lg text-sm focus:outline-none focus:border-[#1a73e8]"
                >
                  <option value="free">Free (1,000 requests/mes)</option>
                  <option value="basic">Basic (10,000 requests/mes)</option>
                  <option value="pro">Pro (100,000 requests/mes)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
                className="px-4 py-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={createApiKey}
                disabled={creating}
                className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear API Key'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
