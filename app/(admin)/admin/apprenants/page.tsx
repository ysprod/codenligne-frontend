'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Ban, CheckCircle2, Clock, RefreshCw, Search, XCircle } from 'lucide-react';
import Link from 'next/link'; // 👈 Ajout
import { useState } from 'react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  status: string;
  accessEndsAt?: string;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ApprenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userToActivate, setUserToActivate] = useState<User | null>(null);
  const [activationDate, setActivationDate] = useState('');
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<UsersResponse, Error>({
    queryKey: ['admin', 'users', search, statusFilter],
    queryFn: async () => {
      const res = await api.get<UsersResponse>('/users', { 
        params: { search, status: statusFilter, limit: 50 } 
      });
      return res.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!userToActivate) return;
      const isoDate = new Date(`${activationDate}T23:59:59`).toISOString();
      await api.post(`/admin/users/${userToActivate._id}/activate`, { accessEndsAt: isoDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
      setUserToActivate(null);
      setActivationDate('');
      alert('Compte activé !');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Gestion des accès</h1>
        <p className="text-ink-soft mt-1">Activez, bloquez ou prolongez les comptes apprenants.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Rechercher un apprenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-border-strong rounded-md w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-border-strong rounded-md bg-white w-full sm:w-48"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="ACTIVE">Actif</option>
          <option value="BLOCKED">Bloqué</option>
          <option value="REFUSED">Refusé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-ink-soft">Chargement des apprenants...</div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">Erreur de chargement</h2>
          <button onClick={() => refetch()} className="btn-secondary mt-4 inline-flex">
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt text-ink-soft border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Apprenant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Fin d&apos;accès</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                      Aucun apprenant trouvé.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-alt/50">
                      <td className="px-4 py-3">
                        {/* 👇 Lien vers la fiche */}
                        <Link href={`/admin/apprenants/${u._id}`} className="block hover:underline">
                          <p className="font-medium text-ink">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-ink-soft">@{u.username} • {u.phone}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          u.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          u.status === 'BLOCKED' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {u.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                          {u.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {u.status === 'BLOCKED' && <Ban className="w-3 h-3" />}
                          {u.status === 'REFUSED' && <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {u.accessEndsAt ? format(new Date(u.accessEndsAt), 'dd MMM yyyy', { locale: fr }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.status === 'PENDING' && (
                          <button
                            onClick={() => setUserToActivate(u)}
                            className="text-primary font-medium hover:underline text-sm"
                          >
                            Activer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {userToActivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-ink mb-2">Activer le compte</h2>
            <p className="text-sm text-ink-soft mb-4">
              Définissez la date de fin d&apos;accès pour <strong>{userToActivate.firstName} {userToActivate.lastName}</strong>.
            </p>
            <input
              type="date"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md mb-4"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setUserToActivate(null)} className="btn-ghost">Annuler</button>
              <button
                onClick={() => activateMutation.mutate()}
                disabled={!activationDate || activateMutation.isPending}
                className="btn-primary"
              >
                {activateMutation.isPending ? 'Activation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}