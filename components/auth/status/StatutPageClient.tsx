'use client';

import { AccessStatus } from '@/lib/interfaces';
import { useAuth } from '@/lib/hooks';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString?: string | Date | null) {
  if (!dateString) return null;
  try {
    // CDC §3 : interprété dans le fuseau Africa/Abidjan
    return format(new Date(dateString), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
  } catch {
    return null;
  }
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function StatutPageClient() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  // Si l'utilisateur n'est pas connecté, on le renvoie vers la connexion
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt" role="status">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" aria-label="Chargement en cours" />
      </div>
    );
  }

  if (!user) return null;

  // ─── Détermination du statut effectif (même logique que le backend) ───
  let effectiveStatus: AccessStatus = user.status;
  
  if (
    user.status === AccessStatus.ACTIVE &&
    user.accessEndsAt &&
    new Date() > new Date(user.accessEndsAt)
  ) {
    effectiveStatus = AccessStatus.EXPIRED;
  }

  const isPending = effectiveStatus === AccessStatus.PENDING;
  const isActive = effectiveStatus === AccessStatus.ACTIVE;
  const isRefused = effectiveStatus === AccessStatus.REFUSED;
  const isBlocked = effectiveStatus === AccessStatus.BLOCKED;
  const isExpired = effectiveStatus === AccessStatus.EXPIRED;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <main className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-4 text-ink">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* En-tête */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="CODENLIGNE" width={64} height={64} className="object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-ink">Statut de votre compte</h1>
          <p className="mt-2 text-base text-ink-soft">
            Bonjour {user.firstName}, voici l&apos;état de votre demande d&apos;accès à la formation.
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Badge de statut */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                isActive ? 'bg-green-100 text-green-700' :
                isPending ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {isActive && <CheckCircle2 className="w-6 h-6" />}
                {isPending && <Clock className="w-6 h-6" />}
                {isRefused && <XCircle className="w-6 h-6" />}
                {isBlocked && <Ban className="w-6 h-6" />}
                {isExpired && <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {isActive && 'Compte actif'}
                  {isPending && 'Compte en attente'}
                  {isRefused && 'Compte refusé'}
                  {isBlocked && 'Compte bloqué'}
                  {isExpired && 'Accès expiré'}
                </h2>
                <p className="text-sm text-ink-soft">
                  {isActive && "Vous avez accès à la formation."}
                  {isPending && "Un administrateur doit valider votre compte."}
                  {isRefused && "Votre demande n'a pas été acceptée."}
                  {isBlocked && "L'accès à votre compte a été suspendu."}
                  {isExpired && "Votre date de fin d'accès est dépassée."}
                </p>
              </div>
            </div>

            {/* Détails spécifiques au statut */}
            <div className="pt-4 border-t border-border space-y-3 text-sm text-ink-soft">
              
              {isPending && (
                <div className="bg-surface-alt p-4 rounded-md">
                  <p className="text-sm text-ink">
                    Votre inscription a bien été enregistrée. Un administrateur va examiner votre demande.
                    Vous n&apos;avez rien d&apos;autre à faire pour le moment.
                  </p>
                </div>
              )}

              {isActive && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Fin d&apos;accès</span>
                  <span>{formatDate(user.accessEndsAt) ?? 'Non définie'}</span>
                </div>
              )}

              {isRefused && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                  <p className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Accès refusé
                  </p>
                  <p className="mt-1 text-sm">
                    Votre demande a été refusée. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, 
                    veuillez contacter l&apos;assistance.
                  </p>
                </div>
              )}

              {isBlocked && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                  <p className="font-medium flex items-center gap-2">
                    <Ban className="w-4 h-4" /> Compte bloqué
                  </p>
                  <p className="mt-1 text-sm">
                    Votre accès a été bloqué par un administrateur. Veuillez contacter l&apos;assistance 
                    pour plus d&apos;informations.
                  </p>
                </div>
              )}

              {isExpired && (
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800">
                  <p className="font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Accès expiré
                  </p>
                  <p className="mt-1 text-sm">
                    Votre accès à la formation a pris fin le {formatDate(user.accessEndsAt)}. 
                    Contactez l&apos;assistance pour le renouveler.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              {isActive ? (
                <Link href="/cours" className="btn-primary w-full">
                  Accéder à mes cours <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <Link href="/assistance" className="btn-secondary w-full">
                  Contacter l&apos;assistance
                </Link>
              )}
              
              <div className="flex gap-3">
                <button onClick={() => refreshUser()} className="btn-ghost flex-1 text-sm" type="button">
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </button>
                <button onClick={handleLogout} className="btn-ghost flex-1 text-sm text-primary border-primary/20 hover:bg-primary/5" type="button">
                  <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-ink-muted mt-8">
          CODENLIGNE • Accès gratuit soumis à validation administrative
        </p>
      </motion.div>
    </main>
  );
}