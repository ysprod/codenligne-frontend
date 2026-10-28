'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Question {
  _id: string;
  statement: string;
  type: 'SINGLE' | 'MULTIPLE';
  options: string[];
  correctOptionIndex?: number;
  correctOptionIndexes?: number[];
  explanation: string;
  difficulty: string;
}

export default function AdminQuestionsPage() {
  const [activeTab, setActiveTab] = useState<'bank' | 'create' | 'auto'>('bank');
  const queryClient = useQueryClient();

  // ─── État pour la création/modification d'une question ───
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statement, setStatement] = useState('');
  const [type, setType] = useState<'SINGLE' | 'MULTIPLE'>('SINGLE');
  const [options, setOptions] = useState(['', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [correctOptionIndexes, setCorrectOptionIndexes] = useState<number[]>([]);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');

  // ─── État pour la création manuelle du QCM ───
  const [quizTitle, setQuizTitle] = useState('');
  const [quizMode, setQuizMode] = useState('TRAINING');
  const [quizDurationMin, setQuizDurationMin] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // ─── État pour la création automatique ───
  const [autoTitle, setAutoTitle] = useState('');
  const [autoMode, setAutoMode] = useState('TRAINING');
  const [autoDurationMin, setAutoDurationMin] = useState('');
  const [autoQuestionCount, setAutoQuestionCount] = useState('10');
  const [autoDifficulty, setAutoDifficulty] = useState('');

  // ─── Récupération de la banque de questions ───
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ['admin', 'questions-bank'],
    queryFn: async () => (await api.get<Question[]>('/quizzes/questions')).data,
  });

  // ─── Mutations ───
  const saveQuestionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        statement, type, options, explanation, difficulty,
        correctOptionIndex: type === 'SINGLE' ? correctOptionIndex : undefined,
        correctOptionIndexes: type === 'MULTIPLE' ? correctOptionIndexes : [],
      };
      if (editingId) {
        await api.put(`/quizzes/questions/${editingId}`, payload);
      } else {
        await api.post('/quizzes/questions', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions-bank'] });
      alert(editingId ? 'Question modifiée (version archivée) !' : 'Question ajoutée à la banque !');
      resetForm();
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  const createQuizMutation = useMutation({
    mutationFn: async () => {
      await api.post('/quizzes', {
        title: quizTitle, mode: quizMode, passThreshold: 16,
        durationSec: quizDurationMin ? parseInt(quizDurationMin, 10) * 60 : undefined,
        questionIds: selectedQuestionIds,
      });
    },
    onSuccess: () => {
      alert('QCM créé avec succès !');
      setQuizTitle(''); setSelectedQuestionIds([]); setQuizDurationMin('');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  const createQuizAutoMutation = useMutation({
    mutationFn: async () => {
      await api.post('/quizzes/auto', {
        title: autoTitle, mode: autoMode, passThreshold: 16,
        durationSec: autoDurationMin ? parseInt(autoDurationMin, 10) * 60 : undefined,
        rules: {
          questionCount: parseInt(autoQuestionCount, 10),
          difficulty: autoDifficulty || undefined,
        },
      });
    },
    onSuccess: () => {
      alert('QCM généré automatiquement !');
      setAutoTitle(''); setAutoQuestionCount('10'); setAutoDifficulty('');
    },
    onError: (e: any) => alert(e.response?.data?.message || e.message),
  });

  // ─── Helpers ───
  const resetForm = () => {
    setEditingId(null);
    setStatement(''); setOptions(['', '']); setExplanation(''); setCorrectOptionIndex(0); setCorrectOptionIndexes([]); setDifficulty('MEDIUM');
  };

  const startEdit = (q: Question) => {
    setEditingId(q._id);
    setStatement(q.statement);
    setType(q.type);
    setOptions(q.options);
    setCorrectOptionIndex(q.correctOptionIndex ?? 0);
    setCorrectOptionIndexes(q.correctOptionIndexes ?? []);
    setExplanation(q.explanation);
    setDifficulty(q.difficulty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateOption = (idx: number, val: string) => {
    const newOptions = [...options]; newOptions[idx] = val; setOptions(newOptions);
  };

  const toggleCorrectOption = (idx: number) => {
    if (type === 'SINGLE') {
      setCorrectOptionIndex(idx);
    } else {
      setCorrectOptionIndexes(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds(prev => prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Gestion des Questions & QCM</h1>
        <p className="text-ink-soft mt-1">Gérez votre banque de questions et composez vos QCM.</p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('bank')}
          className={`py-3 px-6 font-medium border-b-2 transition-colors ${activeTab === 'bank' ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'}`}
        >
          Banque de questions
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`py-3 px-6 font-medium border-b-2 transition-colors ${activeTab === 'create' ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'}`}
        >
          Créer un QCM (Manuel)
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`py-3 px-6 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'auto' ? 'border-primary text-primary' : 'border-transparent text-ink-soft hover:text-ink'}`}
        >
          <Sparkles className="w-4 h-4" /> Génération automatique
        </button>
      </div>

      {/* ─── ONGLET 1 : BANQUE DE QUESTIONS ─── */}
      {activeTab === 'bank' && (
        <div className="space-y-8">
          {/* Formulaire d'ajout/modification */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-ink">
                {editingId ? 'Modifier la question' : 'Ajouter une question'}
              </h2>
              {editingId && (
                <button onClick={resetForm} className="text-sm text-ink-soft hover:text-primary">
                  Annuler la modification
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Énoncé *</label>
                <input type="text" value={statement} onChange={(e) => setStatement(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Posez votre question..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full p-2 border border-border-strong rounded-md bg-white">
                  <option value="SINGLE">Une seule bonne réponse</option>
                  <option value="MULTIPLE">Plusieurs bonnes réponses</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Propositions *</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type={type === 'SINGLE' ? 'radio' : 'checkbox'}
                    name="correctOption"
                    checked={type === 'SINGLE' ? correctOptionIndex === idx : correctOptionIndexes.includes(idx)}
                    onChange={() => toggleCorrectOption(idx)}
                    className="w-4 h-4 text-primary"
                  />
                  <input type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value)} className="flex-1 p-2 border border-border-strong rounded-md" placeholder={`Proposition ${idx + 1}`} />
                </div>
              ))}
              <button onClick={() => setOptions([...options, ''])} className="text-sm text-primary hover:underline mt-2">+ Ajouter une proposition</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Explication *</label>
                <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Obligatoire pour la correction..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulté</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2 border border-border-strong rounded-md bg-white">
                  <option value="EASY">Facile</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HARD">Difficile</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => saveQuestionMutation.mutate()} 
              disabled={!statement || !explanation || saveQuestionMutation.isPending} 
              className="btn-primary w-full"
            >
              <Save className="w-5 h-5 mr-2" /> 
              {editingId ? 'Enregistrer la nouvelle version' : 'Ajouter à la banque'}
            </button>
          </div>

          {/* Liste des questions existantes */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink mb-4">Questions enregistrées ({questions?.length || 0})</h2>
            {isLoadingQuestions ? (
              <p className="text-sm text-ink-soft">Chargement...</p>
            ) : questions?.length === 0 ? (
              <p className="text-sm text-ink-soft italic">Aucune question dans la banque.</p>
            ) : (
              <ul className="divide-y divide-border">
                {questions?.map((q) => (
                  <li key={q._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-ink">{q.statement}</p>
                      <p className="text-xs text-ink-soft mt-1">Type: {q.type} • Difficulté: {q.difficulty} • {q.options.length} propositions</p>
                    </div>
                    <button 
                      onClick={() => startEdit(q)} 
                      className="text-primary hover:bg-primary/5 p-2 rounded-md" 
                      title="Modifier (crée une version archivée)"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ─── ONGLET 2 : CRÉER UN QCM (MANUEL) ─── */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-ink">Paramètres du QCM</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre du QCM *</label>
                <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Ex: Examen blanc" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select value={quizMode} onChange={(e) => setQuizMode(e.target.value)} className="w-full p-2 border border-border-strong rounded-md bg-white">
                  <option value="TRAINING">Entraînement</option>
                  <option value="EVALUATION">Évaluation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée (min)</label>
                <input type="number" value={quizDurationMin} onChange={(e) => setQuizDurationMin(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Optionnel" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink mb-4">Sélectionnez les questions</h2>
            <div className="space-y-2">
              {questions?.map((q) => (
                <label key={q._id} className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-surface-alt cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(q._id)}
                    onChange={() => toggleQuestionSelection(q._id)}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-ink">{q.statement}</p>
                    <p className="text-xs text-ink-soft">Difficulté: {q.difficulty}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => createQuizMutation.mutate()}
            disabled={!quizTitle || selectedQuestionIds.length === 0 || createQuizMutation.isPending}
            className="btn-primary w-full"
          >
            <Save className="w-5 h-5 mr-2" /> Créer le QCM ({selectedQuestionIds.length} questions sélectionnées)
          </button>
        </div>
      )}

      {/* ─── ONGLET 3 : GÉNÉRATION AUTOMATIQUE ─── */}
      {activeTab === 'auto' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-ink">Règles de tirage automatique</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre du QCM *</label>
                <input type="text" value={autoTitle} onChange={(e) => setAutoTitle(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Ex: Examen auto - Signalisation" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select value={autoMode} onChange={(e) => setAutoMode(e.target.value)} className="w-full p-2 border border-border-strong rounded-md bg-white">
                  <option value="TRAINING">Entraînement</option>
                  <option value="EVALUATION">Évaluation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de questions *</label>
                <input type="number" value={autoQuestionCount} onChange={(e) => setAutoQuestionCount(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Ex: 20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulté (optionnel)</label>
                <select value={autoDifficulty} onChange={(e) => setAutoDifficulty(e.target.value)} className="w-full p-2 border border-border-strong rounded-md bg-white">
                  <option value="">Toutes</option>
                  <option value="EASY">Facile</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HARD">Difficile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée (min)</label>
                <input type="number" value={autoDurationMin} onChange={(e) => setAutoDurationMin(e.target.value)} className="w-full p-2 border border-border-strong rounded-md" placeholder="Optionnel" />
              </div>
            </div>
          </div>

          <button
            onClick={() => createQuizAutoMutation.mutate()}
            disabled={!autoTitle || !autoQuestionCount || createQuizAutoMutation.isPending}
            className="btn-primary w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Générer le QCM automatiquement
          </button>
        </div>
      )}
    </div>
  );
}