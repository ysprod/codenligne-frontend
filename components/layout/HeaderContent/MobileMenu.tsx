'use client';
import { useAuth } from '@/lib/hooks';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { memo, useCallback, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileMenuProps {
  userBadge: { text: string; label: string };
  mobileMenuOpen: boolean;
  closeMobileMenu: () => void;
  navItems: NavItem[];
  handleLogout: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

function MobileMenu({
  userBadge,
  mobileMenuOpen,
  closeMobileMenu,
  navItems,
  handleLogout,
}: MobileMenuProps) {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    },
    [closeMobileMenu]
  );

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen, onKeyDown]);

  return (
    <AnimatePresence mode="wait">
      {mobileMenuOpen && (
        <>
          <motion.button
            key="overlay"
            type="button"
            aria-label="Fermer le menu"
            className="lg:hidden fixed inset-0 z-[80] bg-black/55 backdrop-blur-[2px]"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.16 }}
            onClick={closeMobileMenu}
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className={[
              "lg:hidden fixed right-0 top-0 bottom-0 z-[90]",
              "w-[88vw] max-w-sm",
              "h-[100dvh]",
              "bg-white/80 dark:bg-slate-950/75",
              "backdrop-blur-xl",
              "border-l border-black/10 dark:border-white/10",
              "shadow-2xl shadow-black/20",
              "pt-[calc(env(safe-area-inset-top)+10px)]",
              "pb-[calc(env(safe-area-inset-bottom)+12px)]",
            ].join(" ")}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 520, damping: 42, mass: 0.7 }
            }
          >
            <div className="sticky top-0 z-9999 px-3">
              <div className="rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-black/10 dark:border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="h-9 w-9 rounded-xl grid place-items-center border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col items-center justify-center text-center leading-tight">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      AKWABA
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      {user?.username || 'Sagesse'}
                    </div>
                  </div>
                  <div className="h-9 w-9" />
                </div>

                {user?.username && (
                  <div className="px-3 pb-3">
                    <div className="rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5">
                      <div className="flex items-center justify-center gap-2">
                        {userBadge && (
                          <span className="text-xs font-bold text-cosmic-indigo dark:text-[#9BC2FF]">{userBadge.label}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 px-3 h-[calc(100dvh-140px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain">
              <nav aria-label="Navigation principale" className="w-full">
                <ul className="grid gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={["group w-full rounded-2xl px-3 py-3",
                            "border border-black/10 dark:border-white/10",
                            "bg-white/60 dark:bg-white/5",
                            "hover:bg-white/80 dark:hover:bg-white/10",
                            "transition",
                            "flex items-center justify-center gap-3 text-center",
                          ].join(" ")}
                        >
                          {Icon ? (
                            <span className="h-9 w-9 rounded-xl grid place-items-center bg-black/5 dark:bg-white/10">
                              <Icon className="h-5 w-5 text-slate-800 dark:text-slate-100" />
                            </span>
                          ) : null}

                          <span className="flex-1 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                            {item.label}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition">
                            →
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-4 grid gap-2">
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenu();
                      await handleLogout();
                    }}
                    className="w-full rounded-2xl px-3 py-3 text-[13px] font-semibold text-center
                               bg-gradient-to-r from-rose-500/90 to-red-500/90 text-white
                               shadow-lg shadow-rose-500/20"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <a
                    href={`/login?r=${Date.now()}`}
                    onClick={closeMobileMenu}
                    className="w-full rounded-2xl px-3 py-3 text-[13px] font-semibold text-center
                               bg-gradient-to-r from-[#2E5AA6]/95 to-[#4F83D1]/95 text-white
                               shadow-lg shadow-indigo-500/20"
                  >
                    Se connecter
                  </a>
                )}
                <div className="h-2" />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(MobileMenu);