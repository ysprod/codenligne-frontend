'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ShieldAlert } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface AuditLog {
  _id: string;
  actorId: {
    firstName: string;
    lastName: string;
    username: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export default function AdminAuditPage() {
  // 👇 On type useQuery avec AuditLog[]
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => {
      const res = await api.get<AuditLog[]>('/admin/audit');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" /> Journal d&apos;audit
        </h1>
        <p className="text-ink-soft mt-1">Historique des actions administratives sensibles.</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <p className="p-6 text-ink-soft">Chargement...</p>
        ) : logs && logs.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt text-ink-soft border-b border-border">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Cible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-surface-alt/50">
                  <td className="px-4 py-3 text-ink-soft">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    {log.actorId?.firstName} {log.actorId?.lastName}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{log.action}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {log.targetType} ({log.targetId.slice(0, 6)}...)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-ink-soft italic">Aucune action enregistrée pour le moment.</p>
        )}
      </div>
    </div>
  );
}