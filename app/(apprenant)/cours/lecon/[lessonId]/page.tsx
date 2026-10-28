'use client';

import { api } from '@/lib/api/client';
import SafeHtml from '@/components/ui/SafeHtml';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Lesson {
  _id: string;
  title: string;
  content: { html?: string; text?: string }; 
}

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  completedLessonIds: string[];
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params!.lessonId as string;
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, isError } = useQuery<Lesson>({
    queryKey: ['apprenant', 'lesson', lessonId],
    queryFn: async () => {
      const res = await api.get<Lesson>(`/courses/lessons/${lessonId}`);
      return res.data;
    },
  });

  const { data: progress } = useQuery<ProgressStats>({
    queryKey: ['apprenant', 'progress'],
    queryFn: async () => (await api.get<ProgressStats>('/courses/progress')).data,
  });

  const isCompleted = progress?.completedLessonIds?.includes(lessonId);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/courses/lessons/${lessonId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apprenant', 'progress'] });
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-ink-soft">Chargement de la leçon...</div>;
  }

  if (isError || !lesson) {
    return <div className="p-8 text-center text-ink-soft">Leçon introuvable.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link 
        href="/cours" 
        className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au programme
      </Link>

      <article className="bg-white rounded-xl border border-border p-6 sm:p-10 shadow-card">
        <header className="mb-8 border-b border-border pb-6 flex justify-between items-start">
          <h1 className="text-3xl font-bold text-ink">{lesson.title}</h1>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Terminée
            </span>
          )}
        </header>

        <div className="prose prose-sm sm:prose-base max-w-none text-ink">
          {lesson.content?.html ? (
            <SafeHtml html={lesson.content.html} />
          ) : lesson.content?.text ? (
            <p className="whitespace-pre-wrap">{lesson.content.text}</p>
          ) : (
            <p className="italic text-ink-muted">Aucun contenu pour cette leçon.</p>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex justify-end">
          <button 
            onClick={() => completeMutation.mutate()}
            disabled={isCompleted || completeMutation.isPending}
            className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
              isCompleted 
                ? 'bg-green-100 text-green-700 cursor-default' 
                : 'btn-primary'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {isCompleted ? 'Leçon terminée' : 'Marquer comme terminé'}
          </button>
        </div>
      </article>
    </div>
  );
}