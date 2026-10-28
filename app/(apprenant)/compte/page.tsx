'use client';

import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, KeyRound, LogOut, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ComptePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas.');
      }
      if (newPassword.length < 8) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      }
      await api.patch('/users/me/password', { currentPassword, newPassword });
    },
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 5000);
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || error.message);
      setPasswordSuccess(false);
    },
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" /> Mon compte
        </h1>
        <p className="text-base text-ink-soft">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ─── BLOC 1 : Informations personnelles ─── */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-ink">Informations personnelles</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-ink-soft">Nom complet</span>
              <span className="text-sm font-medium text-ink">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-ink-soft">Nom d&apos;utilisateur</span>
              <span className="text-sm font-medium text-ink">@{user.username}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-ink-soft">Téléphone</span>
              <span className="text-sm font-medium text-ink">{user.phone}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-sm text-ink-soft">Email</span>
              <span className="text-sm font-medium text-ink">{user.email || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-ink-soft">Fin d&apos;accès</span>
              <span className="text-sm font-medium text-ink">
                {user.accessEndsAt ? format(new Date(user.accessEndsAt), 'dd MMMM yyyy', { locale: fr }) : 'Non définie'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── BLOC 2 : Changer le mot de passe ─── */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-ink">
            <KeyRound className="w-5 h-5 text-primary" /> Changer le mot de passe
          </h2>
          
          {passwordError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Mot de passe modifié avec succès !</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border border-border-strong rounded-md"
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
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-border-strong rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
              className="btn-primary w-full mt-2"
            >
              {changePasswordMutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>

      {/* ─── BLOC 3 : Déconnexion ─── */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Sécurité
          </h2>
          <p className="text-sm text-ink-soft mt-1">Déconnectez-vous de votre session actuelle.</p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary text-primary border-primary/20 hover:bg-primary/5"
        >
          <LogOut className="w-5 h-5 mr-2" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}