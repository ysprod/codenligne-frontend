'use client';

import CacheLink from '@/components/commons/CacheLink';
import { useLoginForm } from '@/hooks/auth/login/useLoginForm';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import Image from "next/image";
import React, { memo } from "react";

// ============================================================================
// CHAMP DE SAISIE
// ============================================================================

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  error?: string;
  placeholder: string;
  icon: React.ElementType;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginInputField = memo<InputFieldProps>(({
  label,
  name,
  type,
  value,
  error,
  placeholder,
  icon: Icon,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  onChange
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`
            w-full pl-10 ${showPasswordToggle ? 'pr-10' : 'pr-4'} py-3
            text-base text-ink
            border rounded-md bg-white
            transition-all duration-200
            placeholder:text-ink-muted
            ${error
              ? 'border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
              : 'border-border-strong focus:border-ink focus:ring-2 focus:ring-ink/10'
            }
            focus:outline-none
          `}
          autoComplete={name === 'username' ? 'username' : 'current-password'}
        />

        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <motion.p
          id={`${name}-error`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary text-sm flex items-center gap-1 mt-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

LoginInputField.displayName = 'LoginInputField';

// ============================================================================
// ALERTE D'ERREUR GLOBALE (Visible et robuste)
// ============================================================================

export const LoginErrorAlert = memo(({ message }: { message: string }) => {
  // Sécurité : si le message est vide pour une raison bizarre, on met un texte par défaut
  const displayMessage = message && message.trim() !== "" 
    ? message 
    : "Une erreur est survenue lors de la connexion. Veuillez vérifier vos identifiants.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-6 rounded-md border-2 border-red-500 bg-red-50 p-4 flex items-start gap-3 shadow-sm"
      role="alert"
    >
      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <h3 className="text-red-800 font-semibold text-sm mb-1">Échec de la connexion</h3>
        <p className="text-red-700 text-sm leading-relaxed whitespace-pre-line">
          {displayMessage}
        </p>
      </div>
    </motion.div>
  );
});

LoginErrorAlert.displayName = 'LoginErrorAlert';

// ============================================================================
// PAGE DE CONNEXION
// ============================================================================

export default function LoginPageClient() {
  const { handleSubmit, error, isSubmitDisabled, isLoading, isPending, isHydrated, usernameProps, passwordProps } = useLoginForm();

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-surface-alt text-ink">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
          <CacheLink href="/" className="block mb-6 group" aria-label="Retour à l'accueil">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-border flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="CODENLIGNE"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </CacheLink>

          <div className="text-center mb-6">
            <h1 className="mb-2 text-2xl font-bold text-ink sm:text-3xl">
              Connexion
            </h1>
            <p className="mx-auto max-w-md text-base text-ink-soft">
              Accédez à votre espace CODENLIGNE
            </p>
          </div>

          {/* Affichage conditionnel de l'erreur */}
          {error && <LoginErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <LoginInputField {...usernameProps} />
            <LoginInputField {...passwordProps} />
            
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary w-full text-base"
            >
              {isHydrated && (isLoading || isPending) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Connexion en cours…</span>
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-base text-ink-soft">
                Pas encore de compte ?{' '}
                <CacheLink
                  href="/inscription"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Créer un compte
                </CacheLink>
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Connexion sécurisée.</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted mb-16">
          © {new Date().getFullYear()} CODENLIGNE
        </p>
      </div>
    </main>
  );
}