'use client';

import { api } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/reset-confirm', { username, code, newPassword });
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setTimeout(() => router.push('/connexion'), 3000);
    },
    onError: (e: any) => {
      setError(e.response?.data?.message || e.message);
      setSuccess(false);
    },
  });

  return (
    <main className="min-h-screen bg-surface-alt flex items-center justify-center p-4 text-ink">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
          <Link href="/connexion" className="inline-flex items-center text-sm text-ink-muted hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la connexion
          </Link>

          <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-primary" /> Réinitialisation
          </h1>
          <p className="text-base text-ink-soft mb-6">
            Saisissez le code fourni par l&apos;assistance pour définir un nouveau mot de passe.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800">
                Mot de passe modifié avec succès ! Redirection vers la connexion...
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetMutation.mutate();
              }}
              className="space-y-4"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Nom d&apos;utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-border-strong rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code reçu</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border border-border-strong rounded-md text-center text-xl tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-border-strong rounded-md"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="btn-primary w-full"
              >
                {resetMutation.isPending ? 'Validation...' : 'Définir le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}