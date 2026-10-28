'use client';

import { default as CacheLink } from '@/components/commons/CacheLink';
import { useRegisterForm } from '@/hooks/auth/register/useRegisterForm';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, Mail, Phone, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import { memo, default as React } from 'react';

// ============================================================================
// INDICATEUR DE FORCE DU MOT DE PASSE
// ============================================================================

const PASSWORD_STRENGTH_CONFIG = {
  0: { color: 'bg-neutral-200', text: '', textColor: '' },
  1: { color: 'bg-primary', text: 'Faible', textColor: 'text-primary' },
  2: { color: 'bg-state-warning', text: 'Moyen', textColor: 'text-state-warning' },
  3: { color: 'bg-state-warning', text: 'Bon', textColor: 'text-state-warning' },
  4: { color: 'bg-state-success', text: 'Excellent', textColor: 'text-state-success' },
} as const;

interface PasswordStrengthIndicatorProps {
  strength: number;
}

export const RegisterPasswordStrengthIndicator = memo<PasswordStrengthIndicatorProps>(({ strength }) => {
  const config = PASSWORD_STRENGTH_CONFIG[strength as keyof typeof PASSWORD_STRENGTH_CONFIG];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-ink-muted">Force du mot de passe</span>
        <span className={`text-xs font-semibold ${config.textColor}`}>{config.text}</span>
      </div>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              level <= strength ? config.color : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

RegisterPasswordStrengthIndicator.displayName = 'RegisterPasswordStrengthIndicator';

// ============================================================================
// CHAMP TEXTE
// ============================================================================

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  showSuccess?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export const RegisterInputField = memo<InputFieldProps>(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon,
  showPassword,
  onTogglePassword,
  showSuccess,
  required = true,
  autoComplete,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-ink">
      {label} {required && <span className="text-primary" aria-hidden="true">*</span>}
    </label>

    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true">
          {icon}
        </div>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`
          w-full ${icon ? 'pl-10' : 'pl-4'} ${onTogglePassword || showSuccess ? 'pr-10' : 'pr-4'}
          py-3 text-base text-ink
          border rounded-md bg-white
          transition-all duration-200
          placeholder:text-ink-muted
          ${error
            ? 'border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
            : 'border-border-strong focus:border-ink focus:ring-2 focus:ring-ink/10'
          }
          focus:outline-none
        `}
        placeholder={placeholder}
      />

      {onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}

      {showSuccess && !error && value && (
        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-state-success" aria-hidden="true" />
      )}
    </div>

    {error && (
      <motion.p
        id={`${name}-error`}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-primary text-sm flex items-center gap-1"
        role="alert"
      >
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {error}
      </motion.p>
    )}
  </div>
));

RegisterInputField.displayName = 'RegisterInputField';

// ============================================================================
// MESSAGE D'ERREUR GLOBAL
// ============================================================================

interface ErrorMessageProps {
  error: string;
  onClose: () => void;
}

export const RegisterErrorMessage = memo<ErrorMessageProps>(({ error, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="mb-4 rounded-md border border-primary/30 bg-primary/5 p-3 flex items-start gap-2"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
    <p className="flex-1 text-primary text-sm leading-relaxed whitespace-pre-line">{error}</p>
    <button
      type="button"
      onClick={onClose}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-primary hover:text-primary-dark transition-colors -mr-2 -my-2"
      aria-label="Fermer le message d'erreur"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
));

RegisterErrorMessage.displayName = 'RegisterErrorMessage';

// ============================================================================
// FORMULAIRE
// ============================================================================

const RegisterForm: React.FC = () => {
  const {
    showPassword, showConfirmPassword, isSubmitDisabled, isLoading, isPending,
    error, passwordStrength, formData, passwordsMatch, errors, mounted,
    handleChange, handleSubmit, setShowConfirmPassword, setShowPassword, setError,
  } = useRegisterForm();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-surface-alt text-ink">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
          <div className="text-center mb-6">
            <CacheLink href="/" className="inline-block mb-4 group">
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

            <h1 className="mb-2 text-2xl font-bold text-ink sm:text-3xl">Créer un compte</h1>

            <p className="mx-auto max-w-md text-base text-ink-soft">
              Inscription gratuite, soumise à validation administrative.
              Aucun paiement n&apos;est requis.
            </p>
          </div>

          {error && <RegisterErrorMessage error={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RegisterInputField
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Votre prénom"
                icon={<User className="w-4 h-4" />}
                autoComplete="given-name"
              />
              <RegisterInputField
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Votre nom"
                icon={<User className="w-4 h-4" />}
                autoComplete="family-name"
              />
            </div>

            <RegisterInputField
              label="Nom d'utilisateur"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choisissez un nom d'utilisateur unique"
              icon={<User className="w-4 h-4" />}
              showSuccess
              autoComplete="username"
            />

            <RegisterInputField
              label="Téléphone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="07 58 38 53 87"
              icon={<Phone className="w-4 h-4" />}
              autoComplete="tel"
            />

            <RegisterInputField
              label="Adresse électronique (facultatif)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="vous@exemple.com"
              icon={<Mail className="w-4 h-4" />}
              required={false}
              autoComplete="email"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <RegisterInputField
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  autoComplete="new-password"
                />
                {formData.password && <RegisterPasswordStrengthIndicator strength={passwordStrength} />}
              </div>

              <RegisterInputField
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                showSuccess={passwordsMatch}
                autoComplete="new-password"
              />
            </div>

            {/* Acceptation des CGU (CDC §3) */}
            <div className="flex items-start gap-2">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="mt-1 h-5 w-5 rounded border-border-strong text-primary focus:ring-primary/30"
                aria-invalid={errors.acceptedTerms ? 'true' : 'false'}
                aria-describedby={errors.acceptedTerms ? 'acceptedTerms-error' : undefined}
              />
              <label htmlFor="acceptedTerms" className="text-sm text-ink-soft">
                J&apos;accepte les{' '}
                <CacheLink href="/conditions" className="text-primary hover:underline font-medium">
                  conditions d&apos;utilisation
                </CacheLink>
                .
              </label>
            </div>
            {errors.acceptedTerms && (
              <p id="acceptedTerms-error" className="text-primary text-sm flex items-center gap-1" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.acceptedTerms}
              </p>
            )}

            <button
              type="submit"
              disabled={mounted ? isSubmitDisabled : false}
              className="btn-primary w-full text-base"
            >
              {mounted && (isLoading || isPending) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Inscription en cours…</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" aria-hidden="true" />
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-base text-ink-soft">
                Déjà inscrit ?{' '}
                <CacheLink href="/connexion" className="text-primary font-semibold hover:underline">
                  Se connecter
                </CacheLink>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Données sécurisées et confidentielles.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <CacheLink href="/conditions" className="text-sm text-primary hover:underline">
            Conditions générales d&apos;utilisation
          </CacheLink>
        </div>

        <p className="mt-2 text-center text-sm mb-16 text-ink-muted">
          © {new Date().getFullYear()} CODENLIGNE
        </p>
      </div>
    </div>
  );
};

export default function RegisterPageClient() {
  return <RegisterForm />;
}