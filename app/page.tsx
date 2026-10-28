import WelcomePageClient from '@/components/accueil/WelcomePageClient';

/**
 * Page d'accueil CODENLIGNE (CDC §15).
 *
 * Route publique : aucun contrôle d'accès ici.
 * Le composant client gère l'éventuelle redirection d'un utilisateur
 * déjà connecté vers son espace.
 */
export default function WelcomePage() {
  return <WelcomePageClient />;
}