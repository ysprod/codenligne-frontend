'use client';

import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Lesson { _id: string; title: string; }

export default function ChapterPage() {
  const params = useParams();
  const themeId = params!.themeId as string;
  const chapterId = params!.chapterId as string;

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ['apprenant', 'lessons', chapterId],
    queryFn: async () => {
      const res = await api.get<Lesson[]>(`/courses/lessons?chapterId=${chapterId}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <Link href={`/cours/${themeId}`} className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux chapitres
      </Link>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Leçons du chapitre
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <p className="p-6 text-ink-soft">Chargement...</p>
        ) : lessons?.length === 0 ? (
          <p className="p-6 text-ink-soft">Aucune leçon dans ce chapitre.</p>
        ) : (
          <ul className="divide-y divide-border">
            {lessons?.map((lesson, index) => (
              <li key={lesson._id}>
                {/* 👇 Le lien pointe maintenant vers /cours/lecon/[lessonId] */}
                <Link
                  href={`/cours/lecon/${lesson._id}`}
                  className="flex items-center justify-between p-4 hover:bg-surface-alt transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-ink group-hover:text-primary">{lesson.title}</span>
                  </div>
                  <PlayCircle className="w-5 h-5 text-ink-muted group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}