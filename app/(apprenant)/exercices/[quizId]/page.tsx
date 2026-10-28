'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, Clock, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SafeQuestion {
  questionId: string;
  statement: string;
  type: 'SINGLE' | 'MULTIPLE';
  options: string[];
}

interface Attempt {
  _id: string;
  drawSnapshot: SafeQuestion[];
  expiresAt?: string;
  serverTime: string;
}

interface Correction {
  questionId: string;
  statement: string;
  type: 'SINGLE' | 'MULTIPLE';
  options: string[];
  correctOptionIndex?: number;
  correctOptionIndexes?: number[];
  explanation?: string;
  userSelectedOptionIndexes: number[];
}

interface SubmitResult {
  score20: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  correction: Correction[];
}

export default function QuizPassationPage() {
  const params = useParams();
  const quizId = params!.quizId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: attempt, isLoading: isLoadingAttempt, isError: isErrorAttempt } = useQuery<Attempt>({
    queryKey: ['attempt', quizId],
    queryFn: async () => {
      const res = await api.post<Attempt>(`/quizzes/${quizId}/start`);
      return res.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) throw new Error('Tentative introuvable');
      const formattedAnswers = attempt.drawSnapshot.map((q) => ({
        questionId: q.questionId,
        selectedOptionIndexes: answers[q.questionId] ?? [],
      }));

      const res = await api.post<SubmitResult>(`/quizzes/attempts/${attempt._id}/submit`, {
        answers: formattedAnswers,
      });
      return res.data;
    },
    onSuccess: (data) => setResult(data),
    onError: (error: any) => alert(`Erreur : ${error.response?.data?.message || error.message}`),
  });

  // 👇 Gestion du compte à rebours
  useEffect(() => {
    if (!attempt?.expiresAt) return;

    const expires = new Date(attempt.expiresAt).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.floor((expires - now) / 1000));
    
    setTimeLeft(diff);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          if (!result && !submitMutation.isPending) {
            submitMutation.mutate();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt?.expiresAt, result, submitMutation]);

  if (isLoadingAttempt) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-ink-soft">Préparation du QCM...</p>
      </div>
    );
  }

  if (isErrorAttempt || !attempt) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink">Impossible de démarrer le QCM</h2>
        <Link href="/exercices" className="btn-primary mt-6 inline-flex">Retour aux exercices</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className={`rounded-xl border p-8 text-center shadow-sm ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-center mb-4">
            {result.passed ? <CheckCircle2 className="w-16 h-16 text-green-600" /> : <XCircle className="w-16 h-16 text-red-600" />}
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">{result.passed ? 'Félicitations !' : 'Dommage !'}</h1>
          <p className="text-lg text-ink-soft mb-6">Vous avez obtenu <strong className="text-ink">{result.score20.toFixed(2)} / 20</strong></p>
          <p className="text-sm text-ink-muted">{result.correctCount} bonne(s) réponse(s) sur {result.totalQuestions}.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink mb-4">Correction</h2>
          {result.correction.map((q, idx) => {
            const userAnswers = q.userSelectedOptionIndexes || [];
            const corrects = q.type === 'SINGLE' ? [q.correctOptionIndex] : (q.correctOptionIndexes || []);
            const isCorrect = userAnswers.length === corrects.length && userAnswers.every((i) => corrects.includes(i));

            return (
              <div key={q.questionId} className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <h3 className="font-semibold text-ink">Question {idx + 1} : {q.statement}</h3>
                </div>
                <div className="pl-9 space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswers.includes(oIdx);
                    const isCorrectOption = corrects.includes(oIdx);

                    let optionClass = 'border-border-strong bg-white';
                    if (isCorrectOption) optionClass = 'border-green-500 bg-green-50';
                    else if (isSelected) optionClass = 'border-red-500 bg-red-50';

                    return (
                      <div key={oIdx} className={`p-3 rounded-md border ${optionClass} text-sm`}>
                        {opt}
                        {isCorrectOption && <span className="ml-2 text-green-700 font-medium">(Bonne réponse)</span>}
                        {isSelected && !isCorrectOption && <span className="ml-2 text-red-700 font-medium">(Votre choix)</span>}
                      </div>
                    );
                  })}
                  {q.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200">
                      <strong>Explication :</strong> {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-6">
          <Link href="/exercices" className="btn-primary">Retour aux exercices</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.drawSnapshot[currentIndex];
  if (!currentQuestion) return <div className="p-8 text-center text-ink-soft">Erreur de chargement.</div>;

  const safeOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
  const isLastQuestion = currentIndex === attempt.drawSnapshot.length - 1;
  const currentSelected = answers[currentQuestion.questionId] || [];
  const hasAnswered = currentSelected.length > 0;

  const handleSelect = (idx: number) => {
    setAnswers((prev) => {
      const current = prev[currentQuestion.questionId] || [];
      if (currentQuestion.type === 'SINGLE') return { ...prev, [currentQuestion.questionId]: [idx] };
      const newSelection = current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx];
      return { ...prev, [currentQuestion.questionId]: newSelection };
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">
            {currentQuestion.type === 'SINGLE' ? 'Choisissez une réponse' : 'Choisissez plusieurs réponses'}
          </h1>
        </div>
        <div className="text-right flex items-center gap-6">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 font-medium px-3 py-1 rounded-md ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-surface-alt text-ink'}`}>
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-ink-muted">Question</span>
            <div className="text-2xl font-bold text-primary">
              {currentIndex + 1} <span className="text-base text-ink-muted">/ {attempt.drawSnapshot.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-border rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentIndex) / attempt.drawSnapshot.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-6">{currentQuestion.statement}</h2>

        <div className="space-y-3">
          {safeOptions.map((option, idx) => {
            const isSelected = currentSelected.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-surface-alt'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border-2 ${
                  currentQuestion.type === 'SINGLE' ? 'rounded-full' : 'rounded-md'
                } ${isSelected ? 'border-primary bg-primary text-white' : 'border-border-strong'}`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className={`text-base ${isSelected ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="btn-ghost disabled:opacity-50">
          <ChevronLeft className="w-5 h-5 mr-1" /> Précédent
        </button>

        <button
          onClick={() => {
            if (isLastQuestion) submitMutation.mutate();
            else setCurrentIndex((prev) => prev + 1);
          }}
          disabled={!hasAnswered || submitMutation.isPending}
          className="btn-primary"
        >
          {submitMutation.isPending ? 'Envoi en cours...' : isLastQuestion ? 'Terminer le QCM' : <>Suivant <ArrowRight className="w-5 h-5 ml-1" /></>}
        </button>
      </div>
    </div>
  );
}