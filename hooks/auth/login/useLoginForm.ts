import { useAuth } from '@/lib/hooks';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User, Lock } from 'lucide-react';

export interface FormData {
  username: string;
  password: string;
}

export interface FormErrors {
  username?: string;
  password?: string;
}

const MIN_PASSWORD_LENGTH = 6;

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.username.trim()) {
    errors.username = "Nom d'utilisateur requis";
  }

  if (!data.password) {
    errors.password = 'Mot de passe requis';
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Au moins ${MIN_PASSWORD_LENGTH} caractères`;
  }

  return errors;
};

/**
 * Extrait proprement le message d'erreur, que ce soit une erreur Axios
 * (avec un objet response) ou une erreur JS classique.
 */
function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    // 1. Message renvoyé par NestJS (ex: { message: "Identifiants incorrects", statusCode: 401 })
    if (err.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        return err.response.data.message.join(', ');
      }
      return String(err.response.data.message);
    }
    
    // 2. Message d'erreur standard JS
    if (err.message) {
      return String(err.message);
    }
  }
  
  return "Nom d'utilisateur ou mot de passe incorrect.";
}

export function useLoginForm() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();

  const [isHydrated, setIsHydrated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const returnTo = useMemo(() => {
    const param = searchParams?.get('returnTo');
    return param || null;
  }, [searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name as keyof FormErrors]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name as keyof FormErrors];
      return newErrors;
    });

    setError(null);
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

   const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 1. Début de la soumission du formulaire");
    setError(null);
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      console.log("❌ 2. Erreur de validation locale", validationErrors);
      setErrors(validationErrors);
      return;
    }
    
    try {
      console.log("⏳ 3. Envoi de la requête au backend...", formData);
      
      // 1. Connexion
      await login(formData);
      console.log("✅ 4. Connexion réussie (backend OK)");
      
      // 2. Court délai
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // 3. Récupération de l'utilisateur connecté
      const { useAuthStore } = await import('@/lib/store/auth.store');
      const loggedUser = useAuthStore.getState().user;
      console.log("👤 5. Utilisateur dans le store :", loggedUser);

      // 4. Redirection
      if (loggedUser?.role === 'ADMIN' || loggedUser?.role === 'SUPER_ADMIN') {
        console.log("🛣️ 6. Redirection vers /admin");
        window.location.href = '/admin';
      } else if (loggedUser?.status === 'PENDING') {
        console.log("🛣️ 6. Redirection vers /statut");
        window.location.href = '/statut';
      } else if (returnTo) {
        console.log("🛣️ 6. Redirection vers returnTo", returnTo);
        window.location.href = returnTo;
      } else {
        console.log("🛣️ 6. Redirection vers /cours");
        window.location.href = '/cours';
      }
    } catch (err: unknown) {
      console.error("💥 7. Erreur attrapée :", err);
      const message = extractErrorMessage(err);
      setError(message);
    }
  }, [formData, login, returnTo]);

  const isSubmitDisabled = useMemo(() => {
    return isLoading || !formData.username.trim() || !formData.password;
  }, [isLoading, formData.username, formData.password]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const usernameProps = useMemo(() => ({
    label: "Nom d'utilisateur",
    name: "username",
    type: "text",
    value: formData.username,
    error: errors.username,
    placeholder: "Votre nom d'utilisateur",
    icon: User as React.ElementType,
    onChange: handleChange,
  }), [formData.username, errors.username, handleChange]);

  const passwordProps = useMemo(() => ({
    label: "Mot de passe",
    name: "password",
    type: showPassword ? 'text' : 'password',
    value: formData.password,
    error: errors.password,
    placeholder: "••••••••",
    icon: Lock as React.ElementType,
    showPasswordToggle: true,
    showPassword,
    onTogglePassword: togglePassword,
    onChange: handleChange,
  }), [formData.password, errors.password, showPassword, togglePassword, handleChange]);

  return {
   handleSubmit, error, isSubmitDisabled, isLoading, isPending: false, isHydrated, usernameProps, passwordProps,
  };
}