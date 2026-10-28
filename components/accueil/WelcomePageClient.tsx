'use client';

import { api } from '@/lib/api/client';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, LifeBuoy, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, Suspense, useEffect } from 'react';

// ============================================================================
// LOADING FALLBACK — sobre, blanc, spinner rouge
// ============================================================================

const LoadingFallback = memo(() => (
  <div
    className="w-full min-h-screen flex items-center justify-center bg-white"
    role="status"
    aria-live="polite"
    aria-label="Chargement"
  >
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-base text-ink-soft">Chargement…</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// ============================================================================
// CONTENU
// ============================================================================

function WelcomePageClientContent() {
  return (
    <main className="min-h-screen bg-white text-ink" aria-label="Page d'accueil CODENLIGNE">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="container-page flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 select-none touch-target" aria-label="CODENLIGNE — accueil">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <span className="font-bold text-base sm:text-lg tracking-wider text-ink">
              CODENLIGNE
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Navigation principale">
            <Link href="/connexion" className="btn-ghost touch-target text-sm sm:text-base">
              Se connecter
            </Link>
            <Link href="/inscription" className="btn-primary touch-target text-sm sm:text-base">
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="container-page pt-12 pb-16 sm:pt-16 sm:pb-20 text-center" aria-labelledby="hero-title">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="rounded-2xl bg-white p-2 shadow-card border border-border">
            <Image
              src="/logo.png"
              alt="CODENLIGNE"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-ink font-bold tracking-tight"
        >
          CODENLIGNE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-lg sm:text-xl text-ink-soft max-w-2xl mx-auto"
        >
          Apprenez le code de la route à votre rythme.
          Des cours clairs, des exercices corrigés, un suivi personnalisé.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/inscription" className="btn-primary touch-target w-full sm:w-auto text-base">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Créer un compte
          </Link>
          <Link href="/connexion" className="btn-secondary touch-target w-full sm:w-auto text-base">
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Se connecter
          </Link>
        </motion.div>

        <p className="mt-6 text-sm text-ink-muted">
          Accès gratuit, soumis à validation administrative.
        </p>
      </section>

      {/* ─── PROGRAMME ──────────────────────────────────────── */}
      <section className="bg-surface-alt py-16" aria-labelledby="programme-title">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 id="programme-title" className="text-ink">Le programme</h2>
            <p className="mt-3 text-base text-ink-soft max-w-2xl mx-auto">
              Deux rubriques pédagogiques pour progresser efficacement.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            <article className="card p-6" aria-labelledby="cours-title">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary" aria-hidden="true">
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 id="cours-title" className="text-ink">Cours</h3>
              </div>
              <p className="text-base text-ink-soft">
                Des contenus organisés par thèmes, chapitres et leçons.
                Illustrations, vidéos et documents téléchargeables pour
                apprendre à votre rythme.
              </p>
            </article>

            <article className="card p-6" aria-labelledby="qcm-title">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary" aria-hidden="true">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <h3 id="qcm-title" className="text-ink">Exercices QCM</h3>
              </div>
              <p className="text-base text-ink-soft">
                Entraînements par thème et évaluations complètes,
                avec correction, explications et notes sur 20.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ──────────────────────────────── */}
      <section className="py-16" aria-labelledby="etapes-title">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 id="etapes-title" className="text-ink">Comment ça marche</h2>
            <p className="mt-3 text-base text-ink-soft max-w-2xl mx-auto">
              Trois étapes simples pour commencer votre formation.
            </p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto list-none">
            <li className="card p-6 text-center">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-white font-bold text-lg" aria-hidden="true">
                  1
                </span>
              </div>
              <h3 className="text-ink mb-2">Créer un compte</h3>
              <p className="text-base text-ink-soft">
                Renseignez vos informations. L&apos;inscription est gratuite et ne demande aucun paiement.
              </p>
            </li>

            <li className="card p-6 text-center">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-white font-bold text-lg" aria-hidden="true">
                  2
                </span>
              </div>
              <h3 className="text-ink mb-2">Attendre la validation</h3>
              <p className="text-base text-ink-soft">
                Un administrateur examine votre demande et active votre accès avec une date de fin.
                Vous pouvez suivre l&apos;état de votre compte.
              </p>
            </li>

            <li className="card p-6 text-center">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-white font-bold text-lg" aria-hidden="true">
                  3
                </span>
              </div>
              <h3 className="text-ink mb-2">Commencer</h3>
              <p className="text-base text-ink-soft">
                Accédez aux cours et aux QCM, suivez votre progression et consultez vos résultats.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ─── ACCÈS / ASSISTANCE ─────────────────────────────── */}
      <section className="bg-surface-alt py-16" aria-labelledby="acces-title">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 id="acces-title" className="text-ink">Accéder à la formation</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            <Link href="/inscription" className="card p-6 text-center hover:shadow-lg transition-shadow touch-target" aria-label="Créer un compte">
              <UserPlus className="h-8 w-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-ink mb-2">Inscription</h3>
              <p className="text-sm text-ink-soft">Créer un compte gratuitement</p>
            </Link>

            <Link href="/connexion" className="card p-6 text-center hover:shadow-lg transition-shadow touch-target" aria-label="Se connecter">
              <LogIn className="h-8 w-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-ink mb-2">Connexion</h3>
              <p className="text-sm text-ink-soft">Accéder à votre espace</p>
            </Link>

            <Link href="/assistance" className="card p-6 text-center hover:shadow-lg transition-shadow touch-target" aria-label="Contacter l'assistance">
              <LifeBuoy className="h-8 w-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-ink mb-2">Assistance</h3>
              <p className="text-sm text-ink-soft">Besoin d&apos;aide ? Contactez-nous</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-8">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={24} height={24} className="object-contain" />
              <span className="font-semibold text-ink">CODENLIGNE</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Liens de pied de page">
              <Link href="/assistance" className="text-ink-soft hover:text-primary touch-target">
                Assistance
              </Link>
              <Link href="/conditions" className="text-ink-soft hover:text-primary touch-target">
                Conditions d&apos;utilisation
              </Link>
              <Link href="/mentions" className="text-ink-soft hover:text-primary touch-target">
                Mentions légales
              </Link>
            </nav>

            <p className="text-xs text-ink-muted">
              © {new Date().getFullYear()} CODENLIGNE
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            CODENLIGNE est une plateforme pédagogique. Les contenus ne constituent pas une attestation officielle de réussite au permis.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ============================================================================
// WRAPPER CLIENT — redirection si déjà connecté
// ============================================================================

export default function WelcomePageClient() {
  const router = useRouter();

  // Si l'utilisateur a déjà une session valide, on l'envoie vers son espace.
  // On utilise skipAuth + skip401Redirect pour ne pas déclencher de redirection
  // depuis un visiteur anonyme (le bug classique « la landing va au login »).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/auth/me', { skipAuth: true, skip401Redirect: true });
        if (!cancelled && res.status === 200 && (res.data as { _id?: string })?._id) {
          router.replace('/cours');
        }
      } catch {
        // Visiteur anonyme ou session expirée : on reste sur l'accueil.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WelcomePageClientContent />
    </Suspense>
  );
}