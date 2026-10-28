'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ReportData {
  user: { firstName: string; lastName: string; username: string; phone: string };
  generatedAt: string;
  stats: { count: number; averageScore: number | null; bestScore: number | null; lastScore: number | null };
  history: { _id: string; score20: number; passed: boolean; finalizedAt: string }[];
}

export default function RapportPage() {
  const { data: report, isLoading, isError } = useQuery<ReportData>({
    queryKey: ['learner', 'report'],
    queryFn: async () => {
      const res = await api.get<ReportData>('/quizzes/learner/report');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center print:hidden">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-ink-soft">Génération du rapport...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="p-8 text-center print:hidden">
        <p className="text-red-500">Impossible de générer le rapport.</p>
        <Link href="/progression" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Boutons d'action (cachés à l'impression) */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href="/progression" className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4 mr-2" /> Imprimer le rapport
        </button>
      </div>

      {/* Document imprimable (A4) */}
      <div className="bg-white border border-border shadow-card p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        
        {/* En-tête */}
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="CODENLIGNE" width={60} height={60} className="object-contain grayscale" />
            <div>
              <h1 className="text-2xl font-bold text-black uppercase tracking-wider">CODENLIGNE</h1>
              <p className="text-sm text-gray-600">Rapport de progression pédagogique</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Généré le :</p>
            <p className="font-medium text-black">{format(new Date(report.generatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
          </div>
        </div>

        {/* Identité de l'apprenant */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3 uppercase">Identité de l&apos;apprenant</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nom complet</p>
              <p className="font-medium text-black">{report.user.firstName} {report.user.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500">Nom d&apos;utilisateur</p>
              <p className="font-medium text-black">@{report.user.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Téléphone</p>
              <p className="font-medium text-black">{report.user.phone}</p>
            </div>
          </div>
        </div>

        {/* Synthèse */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3 uppercase">Synthèse</h2>
          <div className="grid grid-cols-4 gap-4 border border-gray-300 p-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">QCM terminés</p>
              <p className="text-xl font-bold text-black">{report.stats.count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Moyenne</p>
              <p className="text-xl font-bold text-black">{report.stats.averageScore !== null ? `${report.stats.averageScore}/20` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Meilleur score</p>
              <p className="text-xl font-bold text-black">{report.stats.bestScore !== null ? `${report.stats.bestScore}/20` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Dernier score</p>
              <p className="text-xl font-bold text-black">{report.stats.lastScore !== null ? `${report.stats.lastScore}/20` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3 uppercase">Historique des tentatives</h2>
          {report.history.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Aucune tentative enregistrée.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 text-gray-600 font-medium">Date</th>
                  <th className="py-2 text-gray-600 font-medium">Score</th>
                  <th className="py-2 text-gray-600 font-medium">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {report.history.map((attempt) => (
                  <tr key={attempt._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-black">{format(new Date(attempt.finalizedAt), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="py-2 font-medium text-black">{attempt.score20.toFixed(2)}/20</td>
                    <td className="py-2">
                      {attempt.passed ? 'Réussi' : 'Échoué'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pied de page légal */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-500 text-center">
          <p>Ce rapport est un suivi pédagogique personnel. Il ne constitue pas une attestation officielle de réussite au permis de conduire.</p>
          <p className="mt-1">CODENLIGNE • Document confidentiel</p>
        </div>
      </div>
    </div>
  );
}