'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, FolderTree } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Chapter { _id: string; title: string; description?: string; }

export default function ThemePage() {
  const params = useParams();
  const themeId = params!.themeId as string;

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ['apprenant', 'chapters', themeId],
    queryFn: async () => {
      const res = await api.get<Chapter[]>(`/courses/chapters?themeId=${themeId}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <Link href="/cours" className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux thèmes
      </Link>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-primary" /> Chapitres du thème
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-ink-soft">Chargement...</p>
        ) : chapters?.map((chapter) => (
          <Link
            key={chapter._id}
            href={`/cours/${themeId}/${chapter._id}`}
            className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <h3 className="text-lg font-semibold text-ink group-hover:text-primary">{chapter.title}</h3>
            <p className="text-sm text-ink-soft mt-1">Cliquez pour voir les leçons <ChevronRight className="inline w-4 h-4" /></p>
          </Link>
        ))}
        {chapters?.length === 0 && (
          <p className="text-ink-soft">Aucun chapitre pour ce thème.</p>
        )}
      </div>
    </div>
  );
}