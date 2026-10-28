// ============================================================================
// TYPES & INTERFACES CODENLIGNE
// ============================================================================

// ─── Enums fondamentaux (CDC §2, §3) ────────────────────────────────────────
export enum Role {
  LEARNER = 'LEARNER',
  PEDAGOGICAL_MANAGER = 'PEDAGOGICAL_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum Permission {
  COURSES_MANAGE = 'COURSES_MANAGE',
  QUESTIONS_MANAGE = 'QUESTIONS_MANAGE',
  QUIZZES_MANAGE = 'QUIZZES_MANAGE',
  LEARNERS_VIEW = 'LEARNERS_VIEW',
  ACCESS_MANAGE = 'ACCESS_MANAGE',
  RESULTS_VIEW = 'RESULTS_VIEW',
  SETTINGS_MANAGE = 'SETTINGS_MANAGE',
  ADMINS_MANAGE = 'ADMINS_MANAGE',
  AUDIT_VIEW = 'AUDIT_VIEW',
}

export enum AccessStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REFUSED = 'REFUSED',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
}

// ─── Utilisateur (CDC §3) ───────────────────────────────────────────────────
export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  role: Role;
  customPermissions?: Permission[];
  status: AccessStatus;
  accessEndsAt?: string | Date;
  blockReason?: string;
  refusalReason?: string;
  activatedAt?: string | Date;
  activatedBy?: string;
  lastLoginAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
  version: number;
  preferences?: {
    language?: string;
    notifications?: boolean;
  };
  [key: string]: unknown;
}

// ─── Cours (CDC §4) ─────────────────────────────────────────────────────────
export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Theme {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  status: ContentStatus;
  version: number;
}

export interface Chapter {
  _id: string;
  themeId: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  status: ContentStatus;
  version: number;
}

export interface LessonMedia {
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Lesson {
  _id: string;
  chapterId: string;
  title: string;
  slug: string;
  content: Record<string, unknown>; // Contenu Tiptap
  media: LessonMedia[];
  videoUrl?: string;
  order: number;
  status: ContentStatus;
  publishedAt?: string | Date;
  version: number;
}

export interface Progress {
  _id: string;
  userId: string;
  lessonId: string;
  completedAt: string | Date;
  completedBy: 'manual' | 'auto';
}

// ─── QCM (CDC §5, §7, §8) ───────────────────────────────────────────────────
export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  _id: string;
  statement: string;
  type: QuestionType;
  options: QuestionOption[];
  correctOptionIds: string[];
  explanation: string;
  themeId: string;
  difficulty: QuestionDifficulty;
  illustration?: string;
  lessonId?: string;
  pedagogicalRef?: string;
  status: ContentStatus;
  lastReviewedAt?: string | Date;
  version: number;
}

export enum QuizMode {
  TRAINING = 'TRAINING',
  EVALUATION = 'EVALUATION',
}

export enum CorrectionMode {
  IMMEDIATE = 'IMMEDIATE',
  FINAL = 'FINAL',
}

export interface QuizDrawRules {
  questionCount: number;
  themes: string[];
  perThemeCount?: Record<string, number>;
  difficultyDistribution?: Record<QuestionDifficulty, number>;
  excludedQuestionIds?: string[];
  avoidRecentAttempts?: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  mode: QuizMode;
  durationSec?: number;
  passThreshold: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  correctionMode: CorrectionMode;
  lessonId?: string;
  chapterId?: string;
  drawRules?: QuizDrawRules;
  questionIds?: string[];
  status: ContentStatus;
  version: number;
}

// ─── Tentatives & Résultats (CDC §5, §9) ────────────────────────────────────
export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  FINALIZED_BY_TIMEOUT = 'FINALIZED_BY_TIMEOUT',
}

export interface AttemptQuestionSnapshot {
  questionId: string;
  versionNumber: number;
  statement: string;
  type: QuestionType;
  options: QuestionOption[];
  correctOptionIds: string[];
  explanation: string;
  themeId: string;
  difficulty: QuestionDifficulty;
  illustration?: string;
}

export interface Attempt {
  _id: string;
  userId: string;
  quizId: string;
  mode: QuizMode;
  status: AttemptStatus;
  startedAt: string | Date;
  expiresAt?: string | Date;
  finalizedAt?: string | Date;
  drawSnapshot: AttemptQuestionSnapshot[];
  barème: {
    pointsPerQuestion: number;
    totalQuestions: number;
  };
  score20?: number;
  passed?: boolean;
  correctCount?: number;
  totalQuestions: number;
  interruptedReason?: string;
}

export interface Answer {
  _id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIds: string[];
  isCorrect?: boolean;
  pointsAwarded?: number;
  answeredAt: string | Date;
  saveStatus: 'saved' | 'pending';
}

// ─── Journal & Audit (CDC §12, §13) ─────────────────────────────────────────
export enum AccessAction {
  ACTIVATE = 'ACTIVATE',
  REFUSE = 'REFUSE',
  BLOCK = 'BLOCK',
  REACTIVATE = 'REACTIVATE',
  EXTEND = 'EXTEND',
}

export interface AccessLog {
  _id: string;
  userId: string;
  action: AccessAction;
  actorId: string;
  reason?: string;
  previousStatus: AccessStatus;
  newStatus: AccessStatus;
  previousEndsAt?: string | Date;
  newEndsAt?: string | Date;
  createdAt: string | Date;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  targetType: string;
  targetId: string;
  action: string;
  changes?: Record<string, unknown>;
  reason?: string;
  ip?: string;
  createdAt: string | Date;
}

// ─── Paramètres du site (CDC §6) ────────────────────────────────────────────
export interface SiteSettings {
  _id: string;
  siteName: string;
  logoUrl: string;
  assistanceContact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    hours?: string;
  };
  defaultAccessDurationDays: number;
  recommendationThresholds: {
    minQuestionsPerTheme: number;
    needsReviewBelow: number;
    consolidateBelow: number;
  };
  dataRetentionDays: {
    accounts: number;
    attempts: number;
    auditLogs: number;
  };
  updatedAt: string | Date;
}

// ─── Notifications (in-app) ─────────────────────────────────────────────────
export enum NotificationType {
  ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
  ACCOUNT_REFUSED = 'ACCOUNT_REFUSED',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  ACCESS_EXPIRING_SOON = 'ACCESS_EXPIRING_SOON',
  QUIZ_FINALIZED = 'QUIZ_FINALIZED',
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | Date;
  readAt?: string | Date;
}