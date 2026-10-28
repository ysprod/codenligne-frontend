'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, RefreshCw, UserCheck, Users, XCircle } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  users: {
    total: number;
    pending: number;
    active: number;
    refused: number;
    blocked: number;
    expired: number;
  };
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery<AdminStats>({
    queryKey: ['admin', 'statistics'],
    queryFn: async () => {
      const res = await api.get<AdminStats>('/users/statistics');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-ink-soft">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink">Erreur</h2>
        <p className="text-ink-soft mt-2">Impossible de charger les statistiques.</p>
        <button onClick={() => refetch()} className="btn-secondary mt-6 inline-flex">
          <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Vue générale</h1>
        <p className="text-ink-soft mt-1">Gérez votre plateforme et suivez les inscriptions.</p>
      </div>

      {/* Cartes de statistiques Utilisateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Apprenants total" value={stats.users.total} icon={Users} color="blue" />
        <StatCard title="Comptes actifs" value={stats.users.active} icon={UserCheck} color="green" />
        <StatCard title="En attente" value={stats.users.pending} icon={Clock} color="amber" />
        <StatCard title="Bloqués / Refusés" value={stats.users.blocked + stats.users.refused} icon={XCircle} color="red" />
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/apprenants" className="btn-primary">
            Gérer les accès
          </Link>
          <Link href="/admin/gestion-cours" className="btn-secondary">
            Créer un cours
          </Link>
          <Link href="/admin/questions" className="btn-secondary">
            Créer un QCM
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: 'blue' | 'green' | 'amber' | 'red' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-soft">{title}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}