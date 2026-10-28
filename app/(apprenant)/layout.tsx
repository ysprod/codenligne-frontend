'use client';

import { useAuth } from '@/lib/hooks';
import { BookOpen, ClipboardList, LineChart, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ApprenantLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Sécurité : vérification du rôle et du statut d'accès (CDC §3)
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/connexion');
        return;
      }

      // Si le compte n'est pas ACTIF ou est expiré, on redirige vers /statut
      const isExpired = user?.accessEndsAt && new Date() > new Date(user.accessEndsAt);
      
      if (user?.status !== 'ACTIVE' || isExpired) {
        router.replace('/statut');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-surface-alt" />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const navItems = [
    { label: 'Cours', href: '/cours', icon: BookOpen },
    { label: 'Exercices', href: '/exercices', icon: ClipboardList },
    { label: 'Progression', href: '/progression', icon: LineChart },
    { label: 'Mon compte', href: '/compte', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/cours" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CODENLIGNE" width={32} height={32} className="object-contain" />
            <span className="font-bold text-lg text-ink hidden sm:inline-block">CODENLIGNE</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-ink-soft hidden sm:inline-block">
              {user.firstName}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-ink-muted hover:text-primary transition-colors rounded-md hover:bg-primary/5"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        <nav className="md:w-64 shrink-0">
          <ul className="hidden md:flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname!.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-ink-soft hover:bg-surface-alt hover:text-ink'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-2 pb-safe z-50">
            {navItems.map((item) => {
              const isActive = pathname!.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    isActive ? 'text-primary' : 'text-ink-muted'
                  }`}
                >
                  <item.icon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}