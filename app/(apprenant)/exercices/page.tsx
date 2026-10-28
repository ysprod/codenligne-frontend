'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ClipboardList, PlayCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  mode: 'TRAINING' | 'EVALUATION';
  passThreshold: number;
  questionIds: any[]; // Maintenant on reçoit le tableau complet des questions
}

export default function ExercicesPage() {
  const { data: quizzes, isLoading, isError, refetch } = useQuery<Quiz[], Error>({
    queryKey: ['apprenant', 'quizzes'],
    queryFn: async () => {
      try {
        const res = await api.get<Quiz[]>('/quizzes');
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) return [];
        throw new Error(err.response?.data?.message || "Impossible de charger les exercices.");
      }
    },
    retry: 1,
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> Exercices QCM
        </h1>
        <p className="text-base text-ink-soft">
          Testez vos connaissances avec des entraînements et des évaluations corrigées.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-ink-soft">Chargement des exercices...</p>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink">Erreur de chargement</h3>
          <button onClick={() => refetch()} className="btn-secondary mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </button>
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz._id}
              href={`/exercices/${quiz._id}`}
              className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    quiz.mode === 'TRAINING' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {quiz.mode === 'TRAINING' ? 'Entraînement' : 'Évaluation'}
                  </span>
                  {/* 👇 Affichage du nombre de questions */}
                  <span className="text-xs text-ink-muted">
                    {quiz.questionIds?.length || 0} question(s)
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-ink group-hover:text-primary transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                  {quiz.description || 'Aucune description.'}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
                Commencer <PlayCircle className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 text-border-strong mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink">Aucun exercice disponible</h3>
          <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">
            Les questionnaires sont en cours de préparation. Revenez bientôt !
          </p>
        </div>
      )}
    </div>
  );
}