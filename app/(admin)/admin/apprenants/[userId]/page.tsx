'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle2, Clock, KeyRound, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ResetRequestResponse {
  code: string;
  expiresAt: string;
}

interface UserDetail {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    status: string;
    accessEndsAt?: string;
    createdAt: string;
  };
  accessLogs: {
    _id: string;
    action: string;
    reason?: string;
    createdAt: string;
    actorId: { firstName: string; lastName: string };
  }[];
  stats: {
    count: number;
    averageScore: number | null;
    bestScore: number | null;
    history: {
      _id: string;
      score20: number;
      passed: boolean;
      finalizedAt: string;
    }[];
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params!.userId as string;
  const [resetCode, setResetCode] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<UserDetail>({
    queryKey: ['admin', 'user-detail', userId],
    queryFn: async () => {
      const res = await api.get<UserDetail>(`/users/${userId}/detail`);
      return res.data;
    },
  });

  // 👇 Typage explicite de la mutation
  const generateCodeMutation = useMutation<ResetRequestResponse, Error, void>({
    mutationFn: async () => {
      const res = await api.post<ResetRequestResponse>('/auth/reset-request', { userId });
      return res.data;
    },
    onSuccess: (data) => {
      setResetCode(data.code);
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-ink-soft">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p>Chargement de la fiche...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink">Utilisateur introuvable</h2>
        <Link href="/admin/apprenants" className="btn-secondary mt-4 inline-flex">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const { user, accessLogs, stats } = data;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/apprenants" className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la liste
      </Link>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{user.firstName} {user.lastName}</h1>
          <p className="text-ink-soft mt-1">@{user.username} • {user.phone}</p>
          <p className="text-xs text-ink-muted mt-2">
            Inscrit le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {user.status}
          </span>
          {user.accessEndsAt && (
            <p className="text-sm text-ink-soft mt-2 flex items-center justify-end gap-1">
              <Clock className="w-4 h-4" /> Fin : {format(new Date(user.accessEndsAt), 'dd MMM yyyy', { locale: fr })}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="QCM terminés" value={stats.count.toString()} icon={CheckCircle2} color="blue" />
        <StatCard title="Moyenne" value={stats.averageScore !== null ? `${stats.averageScore}/20` : '-'} icon={TrendingUp} color="amber" />
        <StatCard title="Meilleur score" value={stats.bestScore !== null ? `${stats.bestScore}/20` : '-'} icon={Award} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Réinitialiser le mot de passe
        </h2>
        <p className="text-sm text-ink-soft mb-4">
          Générez un code temporaire à usage unique (valable 30 minutes) à communiquer à l&apos;apprenant.
        </p>

        {resetCode ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
            <p className="text-sm text-green-800 mb-2">Code généré (à communiquer de vive voix) :</p>
            <p className="text-3xl font-mono font-bold text-green-900 tracking-widest">{resetCode}</p>
            <p className="text-xs text-green-700 mt-2">Ce code ne sera plus jamais affiché.</p>
          </div>
        ) : (
          <button
            onClick={() => generateCodeMutation.mutate()}
            disabled={generateCodeMutation.isPending}
            className="btn-secondary"
          >
            {generateCodeMutation.isPending ? 'Génération...' : 'Générer un code de réinitialisation'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4">Dernières tentatives</h2>
        {stats.history.length === 0 ? (
          <p className="text-sm text-ink-soft italic">Aucune tentative enregistrée.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.history.map((attempt) => (
              <li key={attempt._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {attempt.passed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  <span className="font-medium text-ink">Score : {attempt.score20} / 20</span>
                </div>
                <span className="text-sm text-ink-muted">
                  {format(new Date(attempt.finalizedAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4">Historique des décisions</h2>
        {accessLogs.length === 0 ? (
          <p className="text-sm text-ink-soft italic">Aucune décision enregistrée.</p>
        ) : (
          <ul className="divide-y divide-border">
            {accessLogs.map((log) => (
              <li key={log._id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-ink">{log.action}</p>
                    {log.reason && <p className="text-sm text-ink-soft mt-1">Motif : {log.reason}</p>}
                    <p className="text-xs text-ink-muted mt-1">Par {log.actorId?.firstName} {log.actorId?.lastName}</p>
                  </div>
                  <span className="text-xs text-ink-muted">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: 'blue' | 'amber' | 'green' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{title}</p>
        <p className="text-lg font-bold text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}