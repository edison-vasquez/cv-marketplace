import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Key, Workflow, Box, TrendingUp, Plus } from 'lucide-react';

async function getUserStats(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      apiKeys: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          tier: true,
          requestCount: true,
          requestLimit: true,
        },
      },
      workflows: {
        select: { id: true, name: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      },
      deployments: {
        select: { id: true, name: true, status: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  return user;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await getUserStats(session.user.email) : null;

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#5f6368]">No se pudo cargar tu información</p>
      </div>
    );
  }

  const totalRequests = user.apiKeys.reduce((sum, k) => sum + k.requestCount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#202124]">
          Hola, {user.name || 'Usuario'}
        </h1>
        <p className="text-[#5f6368] mt-1">
          Aquí está el resumen de tu cuenta
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5f6368]">API Keys Activas</p>
              <p className="text-3xl font-bold text-[#202124] mt-1">{user.apiKeys.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5f6368]">Requests Totales</p>
              <p className="text-3xl font-bold text-[#202124] mt-1">{totalRequests.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#5f6368]">Tier Actual</p>
              <p className="text-3xl font-bold text-[#202124] mt-1 capitalize">{user.premiumTier || 'Free'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#dadce0] flex items-center justify-between">
          <h2 className="font-bold text-[#202124]">Mis API Keys</h2>
          <Link
            href="/dashboard/api-keys"
            className="text-sm text-[#1a73e8] hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Nueva Key
          </Link>
        </div>

        {user.apiKeys.length === 0 ? (
          <div className="p-6 text-center">
            <Key className="w-10 h-10 text-[#dadce0] mx-auto mb-3" />
            <p className="text-[#5f6368]">No tienes API keys</p>
            <Link
              href="/dashboard/api-keys"
              className="text-[#1a73e8] hover:underline text-sm mt-2 inline-block"
            >
              Crear tu primera API key
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#dadce0]">
            {user.apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-[#5f6368]" />
                  <div>
                    <p className="font-medium text-[#202124]">{key.name}</p>
                    <p className="text-xs text-[#5f6368]">{key.tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#202124]">
                    {key.requestCount.toLocaleString()} / {key.requestLimit.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#5f6368]">requests</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Workflows */}
        <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#dadce0] flex items-center justify-between">
            <h3 className="font-medium text-[#202124]">Workflows Recientes</h3>
            <Link href="/workflow/builder" className="text-xs text-[#1a73e8] hover:underline">
              Ver todos
            </Link>
          </div>
          {user.workflows.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#5f6368]">
              Sin workflows
            </div>
          ) : (
            <div className="divide-y divide-[#dadce0]">
              {user.workflows.map((wf) => (
                <div key={wf.id} className="p-3 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#5f6368]" />
                  <span className="text-sm text-[#202124]">{wf.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deployments */}
        <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#dadce0] flex items-center justify-between">
            <h3 className="font-medium text-[#202124]">Deployments Recientes</h3>
            <Link href="/deployment" className="text-xs text-[#1a73e8] hover:underline">
              Ver todos
            </Link>
          </div>
          {user.deployments.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#5f6368]">
              Sin deployments
            </div>
          ) : (
            <div className="divide-y divide-[#dadce0]">
              {user.deployments.map((dep) => (
                <div key={dep.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#5f6368]" />
                    <span className="text-sm text-[#202124]">{dep.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    dep.status === 'running' ? 'bg-green-100 text-green-700' :
                    dep.status === 'stopped' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {dep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
