import { prisma } from '@/lib/db';
import { Box, Users, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  const [modelCount, userCount, deploymentCount] = await Promise.all([
    prisma.model.count(),
    prisma.user.count(),
    prisma.deployment.count(),
  ]);

  const recentModels = await prisma.model.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      category: true,
      technical: true,
      createdAt: true,
      modelFormat: true,
    },
  });

  return {
    modelCount,
    userCount,
    deploymentCount,
    recentModels,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      label: 'Modelos',
      value: stats.modelCount,
      icon: Box,
      color: 'bg-blue-500',
      href: '/admin/models',
    },
    {
      label: 'Usuarios',
      value: stats.userCount,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/users',
    },
    {
      label: 'Deployments',
      value: stats.deploymentCount,
      icon: Zap,
      color: 'bg-purple-500',
      href: '/admin/deployments',
    },
    {
      label: 'Con ONNX',
      value: stats.recentModels.filter(m => m.modelFormat === 'onnx').length,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/admin/models?filter=onnx',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#202124]">Dashboard</h1>
        <p className="text-[#5f6368] mt-1">Bienvenido al panel de administración de VisionHub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-[#dadce0] rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5f6368] font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-[#202124] mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Models */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#dadce0] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#202124]">Modelos Recientes</h2>
          <Link
            href="/admin/models/new"
            className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg text-sm font-medium hover:bg-[#1557b0] transition-colors"
          >
            + Nuevo Modelo
          </Link>
        </div>

        <div className="divide-y divide-[#dadce0]">
          {stats.recentModels.length === 0 ? (
            <div className="p-6 text-center text-[#5f6368]">
              No hay modelos todavía.{' '}
              <Link href="/admin/models/new" className="text-[#1a73e8] hover:underline">
                Sube el primero
              </Link>
            </div>
          ) : (
            stats.recentModels.map((model) => (
              <Link
                key={model.id}
                href={`/admin/models/${model.id}`}
                className="flex items-center justify-between p-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e8f0fe] rounded-lg flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#1a73e8]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#202124]">{model.title}</p>
                    <p className="text-sm text-[#5f6368]">
                      {model.category} • {model.technical}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {model.modelFormat ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {model.modelFormat.toUpperCase()}
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                      Sin modelo
                    </span>
                  )}
                  <span className="text-sm text-[#5f6368]">
                    {new Date(model.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/models/new"
          className="bg-[#1a73e8] text-white rounded-xl p-6 hover:bg-[#1557b0] transition-colors"
        >
          <h3 className="font-bold text-lg">Subir Modelo ONNX</h3>
          <p className="text-white/80 text-sm mt-1">
            Sube un nuevo modelo para inferencia local en navegador
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white border border-[#dadce0] rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-lg text-[#202124]">Gestionar Usuarios</h3>
          <p className="text-[#5f6368] text-sm mt-1">
            Administra usuarios y permisos premium
          </p>
        </Link>

        <Link
          href="/admin/api-keys"
          className="bg-white border border-[#dadce0] rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-lg text-[#202124]">API Keys</h3>
          <p className="text-[#5f6368] text-sm mt-1">
            Genera y gestiona claves de API premium
          </p>
        </Link>
      </div>
    </div>
  );
}
