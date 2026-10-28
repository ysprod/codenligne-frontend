'use client';
import { memo } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

interface SecuredMainProps {
  children: React.ReactNode;
}

const SecuredMain = memo<SecuredMainProps>(({ children }) => {
  
  return (
    <ProtectedRoute>
      <main
        id="main-content"
        role="main"
        aria-label="Espace sécurisé."
        className="mx-auto w-full px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 dark:text-[color:var(--theme-text-main)]"
      >
        {children}
      </main>
    </ProtectedRoute>
  );
});

SecuredMain.displayName = 'SecuredMain';

export default SecuredMain;