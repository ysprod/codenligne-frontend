import { Permission, Role, User } from '../interfaces';

/**
 * DTO d'inscription — CDC §3
 * Champs obligatoires : nom, prénom, nom d'utilisateur unique,
 * téléphone, mot de passe, acceptation des CGU.
 * Email facultatif.
 */
export interface RegisterDto {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;              // E.164, normalisé côté serveur
  password: string;
  email?: string;
  acceptedTerms: boolean;     // CDC §3 : acceptation obligatoire
}

/**
 * DTO de connexion — CDC §3
 * Connexion par nom d'utilisateur + mot de passe.
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * Réponse d'authentification.
 * Le token est optionnel : on privilégie les cookies httpOnly
 * (CDC §13 : « Les sessions utilisent des cookies sécurisés »).
 */
export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface TokenPayload {
  sub: string;          // userId
  role: Role;
  iat: number;
  exp: number;
}

export type { Permission, Role };