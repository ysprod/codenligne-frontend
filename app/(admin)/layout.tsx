'use client';

import { useAuth } from '@/lib/hooks';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ShieldAlert,
  Users
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Sécurité : si non connecté ou pas admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/connexion');
      } else if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        // Un apprenant ne peut pas accéder à l'admin
        router.replace('/cours');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="min-h-screen bg-surface-alt flex items-center justify-center">Chargement...</div>;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const navItems = [
    { label: 'Vue générale', href: '/admin', icon: LayoutDashboard },
    { label: 'Apprenants & Accès', href: '/admin/apprenants', icon: Users },
    { label: 'Gestion des cours', href: '/admin/gestion-cours', icon: BookOpen },
    { label: 'Questions', href: '/admin/questions', icon: ClipboardList },
    { label: 'Résultats', href: '/admin/resultats', icon: BarChart3 },
 
    // 👇 Ajoute cette ligne (conditionnelle)
    ...(user?.role === 'SUPER_ADMIN' ? [{ label: 'Collaborateurs', href: '/admin/collaborateurs', icon: Shield }] : []),
     { label: 'Audit', href: '/admin/audit', icon: ShieldAlert },
    { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-border flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <Image src="/logo.png" alt="CODENLIGNE" width={32} height={32} className="object-contain" />
          <div>
            <span className="font-bold text-ink block leading-tight">CODENLIGNE</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname!.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink-soft hover:bg-surface-alt hover:text-ink'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="px-4 py-2 bg-surface-alt rounded-lg text-sm">
            <span className="block font-semibold text-ink truncate">{user.firstName} {user.lastName}</span>
            <span className="block text-xs text-ink-muted">{user.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-ink-muted hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header Mobile */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b border-border flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="CODENLIGNE" width={24} height={24} />
            <span className="font-bold text-ink text-sm">Admin</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-ink-muted hover:text-primary">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}