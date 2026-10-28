'use client';

import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Award, BarChart3, BookOpen, CheckCircle2, Download, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
import Link from 'next/link';

interface LearnerStats {
  count: number;
  averageScore: number | null;
  bestScore: number | null;
  lastScore: number | null;
  history: {
    _id: string;
    score20: number;
    passed: boolean;
    finalizedAt: string;
  }[];
}

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  completedLessonIds: string[];
}

export default function ProgressionPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, isError, refetch } = useQuery<LearnerStats>({
    queryKey: ['learner', 'stats'],
    queryFn: async () => (await api.get<LearnerStats>('/quizzes/learner/stats')).data,
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<ProgressStats>({
    queryKey: ['apprenant', 'progress'],
    queryFn: async () => (await api.get<ProgressStats>('/courses/progress')).data,
  });

  if (isLoadingStats || isLoadingProgress) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-ink-soft">Calcul de votre progression...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink">Erreur de chargement</h2>
        <button onClick={() => refetch()} className="btn-secondary mt-6 inline-flex">
          <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
        </button>
      </div>
    );
  }

  const progressPercentage = progress && progress.totalLessons > 0 
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Ma progression
          </h1>
          <p className="text-base text-ink-soft">
            Bonjour {user?.firstName}, voici un résumé de vos performances.
          </p>
        </div>
        <Link href="/rapport" className="btn-secondary whitespace-nowrap">
          <Download className="w-4 h-4 mr-2" /> Mon rapport
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Progression des cours
        </h2>
        {progress?.totalLessons === 0 ? (
          <p className="text-sm text-ink-soft italic">Aucune leçon disponible pour le moment.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-ink">
              <span>{progress?.completedLessons} leçons terminées</span>
              <span>{progress?.totalLessons} leçons au total</span>
            </div>
            <div className="w-full bg-border rounded-full h-3">
              <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="text-sm text-ink-soft text-right mt-1">{progressPercentage}% de complétion</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="QCM terminés" value={stats.count.toString()} icon={CheckCircle2} color="blue" />
        <StatCard title="Moyenne" value={stats.averageScore !== null ? `${stats.averageScore.toFixed(2)}/20` : "Aucun résultat"} icon={TrendingUp} color="amber" />
        <StatCard title="Meilleur score" value={stats.bestScore !== null ? `${stats.bestScore.toFixed(2)}/20` : "Aucun résultat"} icon={Award} color="green" />
        <StatCard title="Dernier score" value={stats.lastScore !== null ? `${stats.lastScore.toFixed(2)}/20` : "Aucun résultat"} icon={BarChart3} color="red" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4">Historique récent</h2>
        {stats.count === 0 ? (
          <div className="text-center py-8 text-ink-soft">
            <p className="text-sm">Vous n&apos;avez pas encore terminé de QCM.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {stats.history.map((attempt) => (
              <li key={attempt._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {attempt.passed ? (
                    <div className="p-2 bg-green-100 rounded-full text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-full text-red-600"><XCircle className="w-5 h-5" /></div>
                  )}
                  <div>
                    <p className="font-medium text-ink">Score : {attempt.score20.toFixed(2)} / 20</p>
                    <p className="text-xs text-ink-muted">
                      {attempt.finalizedAt ? format(new Date(attempt.finalizedAt), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'Date inconnue'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-md ${attempt.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {attempt.passed ? 'Réussi' : 'Échoué'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: 'blue' | 'amber' | 'green' | 'red' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{title}</p>
          <p className="text-lg font-bold text-ink mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}