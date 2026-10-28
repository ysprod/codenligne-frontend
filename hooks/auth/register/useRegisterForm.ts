import { useAuth } from '@/lib/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;

// ============================================================================
// HELPERS
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;

function getRegisterErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    let errorMessage = err.response?.data?.message || "Erreur lors de l'inscription";

    if (err.response?.status === 409) {
      errorMessage = "Un compte existe déjà avec ce nom d'utilisateur ou ce numéro de téléphone.";
    }

    const detailsSource = err.response?.data?.errors;
    if (detailsSource) {
      const details = Object.entries(detailsSource)
        .map(([field, msg]) => `• ${field} : ${msg}`)
        .join('\n');
      errorMessage += '\n' + details;
    }
    return errorMessage;
  }
  return "Erreur lors de l'inscription";
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

function normalizeIvorianPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('225') && digits.length === 13) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+225${digits}`;
  if (digits.length === 9) return `+2250${digits}`;
  return null;
}

function validateForm(formData: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!formData.firstName.trim()) errors.firstName = 'Prénom requis';
  if (!formData.lastName.trim()) errors.lastName = 'Nom requis';

  if (!formData.username.trim()) {
    errors.username = "Nom d'utilisateur requis";
  } else if (/\s/.test(formData.username)) {
    errors.username = "Pas d'espaces autorisés";
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Téléphone requis';
  } else if (!normalizeIvorianPhone(formData.phone)) {
    errors.phone = 'Numéro ivoirien invalide (ex. 0758385387)';
  }

  if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Email invalide';
  }

  if (!formData.password) {
    errors.password = 'Mot de passe requis';
  } else if (formData.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Au moins ${PASSWORD_MIN_LENGTH} caractères`;
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  if (!formData.acceptedTerms) {
    errors.acceptedTerms = "Vous devez accepter les conditions d'utilisation";
  }

  return errors;
}

// ============================================================================
// HOOK (EXPORT NOMMÉ)
// ============================================================================

export function useRegisterForm() {
  const { register, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (name === 'username' && /\s/.test(value)) return;

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    const nextValue = type === 'checkbox' ? target.checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => {
      if (!prev[name as keyof RegisterFormData]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name as keyof RegisterFormData];
      return newErrors;
    });
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const normalizedPhone = normalizeIvorianPhone(formData.phone);
    if (!normalizedPhone) {
      setErrors({ phone: 'Numéro de téléphone invalide' });
      return;
    }

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        phone: normalizedPhone,
        email: formData.email.trim() || undefined,
        password: formData.password,
        acceptedTerms: formData.acceptedTerms,
      });
    } catch (err: unknown) {
      setError(getRegisterErrorMessage(err));
    }
  }, [formData, register]);

  const passwordsMatch = useMemo(
    () => formData.password === formData.confirmPassword && formData.confirmPassword !== '',
    [formData.password, formData.confirmPassword]
  );

  const isSubmitDisabled = useMemo(
    () => isLoading || !formData.username || !formData.password || !formData.acceptedTerms,
    [isLoading, formData.username, formData.password, formData.acceptedTerms]
  );

  return {
    showPassword,
    showConfirmPassword,
    isSubmitDisabled,
    isLoading,
    isPending: false, // On n'utilise pas useTransition ici
    error,
    passwordStrength,
    formData,
    passwordsMatch,
    errors,
    mounted,
    handleChange,
    handleSubmit,
    setShowConfirmPassword,
    setShowPassword,
    setError,
  };
}