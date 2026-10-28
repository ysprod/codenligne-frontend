import { User } from '@/lib/interfaces';
import { api } from '../client';
import { endpoints } from '../endpoints';

/**
 * Service utilisateurs — CODENLIGNE
 *
 * Remplace l'ancien `usersService` Mon Étoile (getConsultants, getById).
 * CODENLIGNE n'a pas de « consultants » : il y a des apprenants et des
 * collaborateurs (gestionnaire pédagogique, admin, super admin).
 *
 * Les endpoints sont définis dans `lib/api/endpoints.ts` (à aligner aussi).
 */

// ============================================================================
// DTO
// ============================================================================

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  photo?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ReportParams {
  from?: string;   // ISO date (UTC)
  to?: string;     // ISO date (UTC)
  mode?: 'all' | 'training' | 'evaluation';
}

export interface ReportData {
  user: Pick<User, '_id' | 'firstName' | 'lastName' | 'username'>;
  period: { from: string; to: string; generatedAt: string };
  progress: {
    totalLessons: number;
    completedLessons: number;
    ratio: number;               // 0..1
    noLesson?: boolean;          // true si aucune leçon disponible
  };
  quiz: {
    completedCount: number;
    average20: number | null;    // null si aucune tentative
    best20: number | null;
    last20: number | null;
    hasAttempts: boolean;
  };
  history: Array<{
    attemptId: string;
    quizTitle: string;
    mode: 'TRAINING' | 'EVALUATION';
    score20: number;
    passed: boolean;
    finalizedAt: string;
  }>;
  byTheme: Array<{
    themeId: string;
    themeTitle: string;
    questionsEvaluated: number;
    correctRate: number;         // 0..1
    status: 'needs_review' | 'consolidate' | 'mastered' | 'insufficient_data';
  }>;
  recommendations: Array<{
    themeId: string;
    themeTitle: string;
    reason: string;
    suggestedLessons: Array<{ lessonId: string; title: string }>;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

export const usersService = {
  /**
   * Profil de l'utilisateur connecté.
   * Côté serveur, l'apprenant ne peut lire que SON profil (CDC §12) :
   * l'endpoint /api/v1/users/me est scopé par le token.
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>(endpoints.users.me);
    return response.data;
  },

  /**
   * Mise à jour du profil (nom, prénom, email facultatif, photo).
   * Le statut, le rôle et la date d'expiration ne sont PAS modifiables
   * par l'apprenant (CDC §3, §12) : ils sont gérés par l'admin.
   */
  async updateProfile(dto: UpdateProfileDto): Promise<User> {
    const response = await api.patch<User>(endpoints.users.me, dto);
    return response.data;
  },

  /**
   * Changement de mot de passe (CDC §3).
   * Révoque les sessions antérieures côté serveur.
   */
  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.post<void>(endpoints.users.mePassword, dto);
  },

  /**
   * Données agrégées pour le rapport PDF (CDC §11).
   * Le rapport est généré côté navigateur (window.print + CSS @page),
   * mais les données viennent de cet endpoint pour garantir la cohérence
   * avec le tableau de bord (mêmes filtres, mêmes calculs).
   */
  async getReportData(params: ReportParams = {}): Promise<ReportData> {
    const response = await api.get<ReportData>(endpoints.users.meReport, { params });
    return response.data;
  },
};

export default usersService;