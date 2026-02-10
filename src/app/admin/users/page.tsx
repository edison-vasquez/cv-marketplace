import { prisma } from '@/lib/db';
import { Users, Shield, Crown, Mail, Calendar } from 'lucide-react';

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          apiKeys: true,
          workflows: true,
          deployments: true,
        },
      },
    },
  });

  return users;
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  const stats = {
    total: users.length,
    admins: users.filter(u => u.isAdmin).length,
    premium: users.filter(u => u.premiumTier && u.premiumTier !== 'free').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#202124]">Usuarios</h1>
        <p className="text-[#5f6368] mt-1">Gestiona usuarios y permisos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#202124]">{stats.total}</p>
            <p className="text-sm text-[#5f6368]">Total Usuarios</p>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#202124]">{stats.admins}</p>
            <p className="text-sm text-[#5f6368]">Administradores</p>
          </div>
        </div>
        <div className="bg-white border border-[#dadce0] rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#202124]">{stats.premium}</p>
            <p className="text-sm text-[#5f6368]">Premium</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Usuario
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Rol
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                API Keys
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Actividad
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                Registro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
                  <p className="text-[#5f6368]">No hay usuarios registrados</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a73e8] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#202124]">{user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-[#5f6368] flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        Usuario
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.premiumTier === 'pro' ? 'bg-yellow-100 text-yellow-700' :
                      user.premiumTier === 'basic' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.premiumTier || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {user._count.apiKeys} keys
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    {user._count.workflows} workflows, {user._count.deployments} deploys
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6368]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
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
