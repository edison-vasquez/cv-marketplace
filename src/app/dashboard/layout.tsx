import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { Key, User, Settings, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Resumen' },
    { href: '/dashboard/api-keys', icon: Key, label: 'API Keys' },
    { href: '/dashboard/profile', icon: User, label: 'Perfil' },
    { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#dadce0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124]">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
            <div className="h-6 w-px bg-[#dadce0]" />
            <h1 className="text-lg font-bold text-[#202124]">Mi Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-[#5f6368]">{session.user?.email}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#5f6368] hover:bg-white hover:text-[#202124] transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
