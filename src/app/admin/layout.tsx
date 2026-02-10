import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { LayoutDashboard, Box, Users, Settings, ArrowLeft, Key } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  // Verificar autenticación y permisos de admin
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  // Verificar si es admin (por ahora cualquier usuario autenticado puede acceder)
  // En producción, verificar: if (!session.user.isAdmin) redirect('/')
  const isAdmin = true; // TODO: Verificar session.user.isAdmin

  if (!isAdmin) {
    redirect('/');
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/models', icon: Box, label: 'Modelos' },
    { href: '/admin/users', icon: Users, label: 'Usuarios' },
    { href: '/admin/api-keys', icon: Key, label: 'API Keys' },
    { href: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#dadce0] z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al sitio</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-[#202124]">VisionHub</h1>
            <p className="text-xs text-[#5f6368] mt-1">Panel de Administración</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#dadce0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#202124] truncate">
                {session.user?.name || 'Admin'}
              </p>
              <p className="text-xs text-[#5f6368] truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
