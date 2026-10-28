'use client';
import { memo, useEffect, useLayoutEffect, useRef } from 'react';

interface SecuredHeaderProps {
  children: React.ReactNode;
}

// useLayoutEffect client (mesure avant peinture), useEffect serveur (pas de warning SSR).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SecuredHeader = memo<SecuredHeaderProps>(({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Expose la hauteur du header en var CSS `--app-header-h` pour que les
  // PageSubHeader se collent juste dessous (maj au resize).
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const apply = () =>
      document.documentElement.style.setProperty('--app-header-h', `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="theme-dark-panel sticky top-0 z-50 border-b border-[var(--accent-violet)]/40 dark:border-[var(--accent-gold)]/40 bg-[var(--bg-light)]/80 dark:bg-[var(--bg-dark)]/86 backdrop-blur mb-8">
      <div className="pt-[env(safe-area-inset-top)]" />
      {children}
    </div>
  );
});

SecuredHeader.displayName = 'SecuredHeader';

export default SecuredHeader;
