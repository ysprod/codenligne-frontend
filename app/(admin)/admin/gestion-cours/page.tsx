'use client';

import { api } from '@/lib/api/client';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, FolderTree, Plus } from 'lucide-react';
import { useState } from 'react';

interface Theme { _id: string; title: string; }
interface Chapter { _id: string; title: string; themeId: string; }
interface Lesson { _id: string; title: string; chapterId: string; }

export default function AdminGestionCoursPage() {
  const [themeTitle, setThemeTitle] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [selectedThemeForChapter, setSelectedThemeForChapter] = useState('');
  const [selectedChapterForLesson, setSelectedChapterForLesson] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [content, setContent] = useState('');
  
  const queryClient = useQueryClient();

  const { data: themes } = useQuery<Theme[]>({
    queryKey: ['admin', 'themes'],
    queryFn: async () => (await api.get<Theme[]>('/courses/themes')).data,
  });

  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ['admin', 'chapters'],
    queryFn: async () => (await api.get<Chapter[]>('/courses/chapters')).data,
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: ['admin', 'lessons'],
    queryFn: async () => (await api.get<Lesson[]>('/courses/lessons')).data,
  });

  // Mutations
  const createThemeMutation = useMutation({
    mutationFn: async () => api.post('/courses/themes', { title: themeTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'themes'] });
      setThemeTitle('');
      alert('Thème créé !');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  const createChapterMutation = useMutation({
    mutationFn: async () => api.post('/courses/chapters', { title: chapterTitle, themeId: selectedThemeForChapter }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chapters'] });
      setChapterTitle('');
      alert('Chapitre créé !');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  const createLessonMutation = useMutation({
    mutationFn: async () => api.post('/courses/lessons', { 
      title: lessonTitle, 
      chapterId: selectedChapterForLesson, 
      content: { html: content }, 
      status: 'PUBLISHED' 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons'] });
      setLessonTitle('');
      setContent('');
      alert('Leçon créée !');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Gestion des cours</h1>
        <p className="text-ink-soft mt-1">Structure : Thème → Chapitre → Leçon</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOC 1 : Créer un thème */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-md font-semibold mb-4 flex items-center gap-2 text-ink">
            <Plus className="w-4 h-4 text-primary" /> 1. Nouveau Thème
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={themeTitle}
              onChange={(e) => setThemeTitle(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md text-sm"
              placeholder="Ex: La signalisation"
            />
            <button
              onClick={() => createThemeMutation.mutate()}
              disabled={!themeTitle || createThemeMutation.isPending}
              className="btn-primary w-full text-sm py-2"
            >
              Créer le thème
            </button>
          </div>
        </div>

        {/* BLOC 2 : Créer un chapitre */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-md font-semibold mb-4 flex items-center gap-2 text-ink">
            <FolderTree className="w-4 h-4 text-primary" /> 2. Nouveau Chapitre
          </h2>
          <div className="space-y-3">
            <select
              value={selectedThemeForChapter}
              onChange={(e) => setSelectedThemeForChapter(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md text-sm bg-white"
            >
              <option value="">Sélectionner un thème</option>
              {themes?.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
            </select>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md text-sm"
              placeholder="Ex: Les panneaux de danger"
            />
            <button
              onClick={() => createChapterMutation.mutate()}
              disabled={!chapterTitle || !selectedThemeForChapter || createChapterMutation.isPending}
              className="btn-primary w-full text-sm py-2"
            >
              Créer le chapitre
            </button>
          </div>
        </div>

        {/* BLOC 3 : Créer une leçon */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-md font-semibold mb-4 flex items-center gap-2 text-ink">
            <BookOpen className="w-4 h-4 text-primary" /> 3. Nouvelle Leçon
          </h2>
          <div className="space-y-3">
            <select
              value={selectedThemeForChapter}
              onChange={(e) => setSelectedThemeForChapter(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md text-sm bg-white"
            >
              <option value="">Sélectionner un thème</option>
              {themes?.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
            </select>
            <select
              value={selectedChapterForLesson}
              onChange={(e) => setSelectedChapterForLesson(e.target.value)}
              disabled={!selectedThemeForChapter}
              className="w-full p-2 border border-border-strong rounded-md text-sm bg-white disabled:bg-gray-100"
            >
              <option value="">Sélectionner un chapitre</option>
              {chapters?.filter(c => c.themeId === selectedThemeForChapter).map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full p-2 border border-border-strong rounded-md text-sm"
              placeholder="Titre de la leçon"
            />
            <button
              onClick={() => createLessonMutation.mutate()}
              disabled={!lessonTitle || !selectedChapterForLesson || !content || createLessonMutation.isPending}
              className="btn-primary w-full text-sm py-2"
            >
              Publier la leçon
            </button>
          </div>
        </div>
      </div>
      
      {/* Editeur de texte pour la leçon */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <h2 className="text-md font-semibold mb-4 text-ink">Contenu de la leçon</h2>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* ─── LISTE DES LEÇONS CRÉÉES ─── */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-ink flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Leçons publiées
        </h2>
        
        {isLoadingLessons ? (
          <p className="text-sm text-ink-soft">Chargement des leçons...</p>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-6">
            {themes?.map((theme) => {
              // On récupère les chapitres de ce thème
              const themeChapters = chapters?.filter(c => c.themeId === theme._id) || [];
              // On récupère les leçons de ces chapitres
              const themeLessons = lessons.filter(l => 
                themeChapters.some(c => c._id === l.chapterId)
              );

              if (themeLessons.length === 0) return null;

              return (
                <div key={theme._id} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface-alt px-4 py-2 font-medium text-ink border-b border-border">
                    {theme.title}
                  </div>
                  <ul className="divide-y divide-border">
                    {themeLessons.map((lesson) => {
                      const parentChapter = chapters?.find(c => c._id === lesson.chapterId);
                      return (
                        <li key={lesson._id} className="px-4 py-3 flex items-center justify-between hover:bg-surface-alt/50">
                          <div>
                            <span className="text-sm font-medium text-ink block">{lesson.title}</span>
                            <span className="text-xs text-ink-muted">Chapitre : {parentChapter?.title || 'Inconnu'}</span>
                          </div>
                          <span className="text-xs text-ink-muted bg-white border border-border px-2 py-1 rounded">
                            Publiée
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Aucune leçon publiée pour le moment.</p>
        )}
      </div>
    </div>
  );
}