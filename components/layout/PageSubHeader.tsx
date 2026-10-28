'use client';
import { ReactNode } from 'react';

interface PageSubHeaderProps {
  /** Titre affiché à gauche. */
  title: ReactNode;
  /** Contenu optionnel à droite (ex. total panier, actions). */
  right?: ReactNode;
  /** Se colle sous le header principal (défaut) ou défile avec le contenu. */
  sticky?: boolean;
  /** Classes supplémentaires sur le conteneur (ex. arrondis). */
  className?: string;
}

/**
 * Sous-en-tête réutilisable. En mode `sticky`, se colle sous le header via la var
 * CSS `--app-header-h` (posée par SecuredHeader) → pas de chevauchement au scroll.
 */
export default function PageSubHeader({
  title,
  right,
  sticky = true,
  className = '',
}: PageSubHeaderProps) {
  return (
    <div
      className={`w-full flex items-center justify-center bg-gradient-to-r from-[#0F1C3F]/95 to-[#162A56]/95 backdrop-blur-md border-b border-[#2E5AA6] shadow-sm ${sticky ? 'sticky z-30' : ''} ${className}`}
      style={sticky ? { top: 'var(--app-header-h, 5rem)' } : undefined}
    >
      <div className="flex items-center justify-between px-4 py-3 w-full max-w-5xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg sm:text-xl text-[#4F83D1] drop-shadow">{title}</span>
        </div>
        {right ? <div className="flex items-center gap-4">{right}</div> : null}
      </div>
    </div>
  );
}
