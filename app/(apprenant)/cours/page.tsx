'use client';

import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, BookOpen, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Theme {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

export default function CoursPage() {
  const { user } = useAuth();

  // Récupération des thèmes depuis le backend avec gestion des états
  const { data: themes, isLoading, isError, refetch } = useQuery<Theme[], Error>({
    queryKey: ['apprenant', 'themes'],
    queryFn: async () => {
      try {
        const res = await api.get<Theme[]>('/courses/themes');
        return res.data;
      } catch (err: any) {
        throw new Error(
          err.response?.data?.message || "Impossible de charger les cours pour le moment."
        );
      }
    },
    retry: 1,
  });

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink mb-2">
          Bonjour {user?.firstName} 👋
        </h1>
        <p className="text-base text-ink-soft">
          Prêt à réviser votre code de la route ? Choisissez un thème pour commencer.
        </p>
      </div>

      {/* Liste des thèmes */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Programme de formation
        </h2>

        {/* 1. ÉTAT DE CHARGEMENT */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-border p-8 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-ink-soft">Chargement de votre programme...</p>
          </div>
        ) : 
        
        /* 2. ÉTAT D'ERREUR */
        isError ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-ink">Oups, une erreur est survenue</h3>
            <p className="text-sm text-ink-soft mt-2 mb-6 max-w-md mx-auto">
              Nous n&apos;avons pas pu charger la liste des cours. Vérifiez votre connexion internet ou réessayez plus tard.
            </p>
            <button
              onClick={() => refetch()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : 
        
        /* 3. ÉTAT VIDE (Aucun cours n'a été créé par l'admin) */
        themes && themes.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-border-strong mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink">Aucun cours disponible</h3>
            <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">
              Les cours sont en cours de préparation par l&apos;équipe pédagogique. Revenez bientôt !
            </p>
          </div>
        ) : 
        
        /* 4. ÉTAT NORMAL (Liste des thèmes) */
        (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes?.map((theme) => (
              <Link
                key={theme._id}
                href={`/cours/${theme._id}`}
                className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-ink group-hover:text-primary transition-colors">
                    {theme.title}
                  </h3>
                  <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                    {theme.description || 'Aucune description pour ce thème.'}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> À votre rythme
                  </span>
                  <span className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform">
                    Commencer <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}