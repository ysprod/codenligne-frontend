'use client';
import CacheLink from '@/components/commons/CacheLink';
import { useHeaderState } from '@/hooks/commons/useHeaderState';
import type { MotionValue } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Crown, LogOut, LucideIcon, Menu, Settings, Sparkles, User, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import MobileMenu from './MobileMenu';

interface MobileHeaderActionsProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function MobileHeaderActions({
  mobileMenuOpen,
  setMobileMenuOpen
}: MobileHeaderActionsProps) {
  return (
    <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
 

      <motion.button
        whileTap={{ scale: 0.9, rotate: 90 }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="rounded-xl bg-gradient-to-br from-[#EEF4FF] to-[#DDE7FA] p-2 
                   text-[#2E5AA6]
                   hover:shadow-lg hover:shadow-[#2E5AA6]/20
                   transition-all"
      >
        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderNavigationProps {
  navItems: NavItem[];
}

export function HeaderNavigation({ navItems }: HeaderNavigationProps) {

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <CacheLink key={item.href} href={item.href}>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold
                         text-slate-700 dark:text-slate-300 hover:text-[#2E5AA6] dark:hover:text-[#9BC2FF] 
                         hover:bg-[#EEF4FF] dark:hover:bg-[#0F1C3F]/50
                         transition-all duration-200 group"
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />

              <span>{item.label}</span>

            </motion.button>
          </CacheLink>
        );
      })}
    </nav>
  );
}

interface ScrollProgressBarProps {
  scrollY: MotionValue<number>;
  progressWidth: string | MotionValue<string>;
}

export function ScrollProgressBar({ scrollY, progressWidth }: ScrollProgressBarProps) {

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-[#2E5AA6] via-[#4F83D1] to-[#9BC2FF]"
      style={{ width: scrollY.get() > 0 ? progressWidth : '0%' }}
    >
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="h-full w-1/4 bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
    </motion.div>
  );
}

export function HeaderLogo() {

  return (
    <CacheLink href="/star/profil" className="flex items-center gap-2 sm:gap-2.5 group">
      <motion.div
        whileHover={{ rotate: 360, scale: 1.08 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#2E5AA6] via-[#4F83D1] to-[#244A8A] p-[2px] shadow-xl shadow-[#2E5AA6]/35 sm:h-12 sm:w-12">
          <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Mon Étoile"
              width={36}
              height={36}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              priority
            />
          </div>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 -z-10 rounded-xl bg-[#4F83D1] opacity-40 blur-lg"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      <div className="hidden sm:block">
        <h1 className="flex items-center gap-1.5 bg-gradient-to-r from-[#244A8A] via-[#2E5AA6] to-[#4F83D1] bg-clip-text text-lg font-black text-transparent sm:text-xl">
          Mon Étoile
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="h-4 w-4 text-[#2E5AA6]" />
          </motion.div>
        </h1>
      </div>

      <div className="sm:hidden">
        <h1 className="bg-gradient-to-r from-[#244A8A] to-[#4F83D1] bg-clip-text text-base font-black text-transparent">
          Mon Étoile
        </h1>
      </div>
    </CacheLink>
  );
}

type UserMenuUser = {
  username?: string;
};

interface UserMenuProps {
  user: UserMenuUser | null;
  userBadge: { text: string; label: string };
  mounted: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => void;
}

export function UserMenu({ user, userBadge, mounted, showUserMenu, setShowUserMenu, handleLogout }: UserMenuProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const canRenderClientValues = hydrated && mounted;
  const displayUserName = canRenderClientValues ? user?.username || 'Utilisateur' : 'Utilisateur';
  const displayBadgeText = canRenderClientValues ? userBadge.text : 'Profil';
  const displayBadgeLabel = canRenderClientValues ? userBadge.label : 'Profil utilisateur';

  return (
    <div className="relative user-menu-container">
      <motion.button
        onClick={() => setShowUserMenu(!showUserMenu)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 rounded-xl bg-gradient-lux-light dark:bg-gradient-lux-dark px-3 py-2
             border-2 border-[var(--accent-violet)] dark:border-[var(--accent-gold)]
             hover:border-[var(--accent-gold)] dark:hover:border-[var(--accent-violet)]
             hover:shadow-lg hover:shadow-[var(--accent-violet)]/20
             transition-all duration-300"
      >
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-gold)] flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1"
          >
            <Crown className="w-4 h-4 text-[var(--accent-gold)] drop-shadow-lg" />
          </motion.div>
        </div>

        <div className="text-left">
          <p suppressHydrationWarning className="text-sm font-bold text-[var(--text-light)] dark:text-[var(--text-dark)] leading-tight max-w-[120px] truncate">
            {displayUserName}
          </p>
          <p suppressHydrationWarning className="bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-violet)] bg-clip-text text-xs font-black text-transparent">
            {displayBadgeText}
          </p>
        </div>

        <motion.div
          animate={{ rotate: showUserMenu ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--accent-violet)] dark:text-[var(--accent-gold)]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl 
                       shadow-2xl border-2 border-[#DDE7FA] dark:border-[#2E5AA6]/35 overflow-hidden z-50"
          >
            <div className="border-b border-[#DDE7FA] bg-gradient-to-br from-[#EEF4FF] to-[#DDE7FA] px-4 py-3 
                          dark:from-[#0F1C3F]/50 dark:to-[#162A56]/45 
                          dark:border-[#2E5AA6]/35">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2E5AA6] to-[#4F83D1] 
                                flex items-center justify-center shadow-md relative">
                  <User className="w-6 h-6 text-white" />
                  <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                </div>

                <div>
                  <p suppressHydrationWarning className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {displayUserName}
                  </p>
                  <p suppressHydrationWarning className="text-xs font-semibold text-[#2E5AA6] dark:text-[#9BC2FF]">{displayBadgeLabel}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <CacheLink href="/star/monprofil" onClick={() => setShowUserMenu(false)}>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-slate-700 dark:text-slate-300 hover:bg-[#EEF4FF] dark:hover:bg-[#0F1C3F]/50
                             hover:text-[#2E5AA6] dark:hover:text-[#9BC2FF]
                             transition-all font-semibold text-sm"
                >
                  <Settings className="w-5 h-5" />
                  Profil
                </motion.button>
              </CacheLink>

              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                           text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30
                           transition-all font-semibold text-sm"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HeaderContent() {
  const {
    user, mounted, mobileMenuOpen, isScrolled, showUserMenu, hasMountedUser,
    scrollY, userBadge, navItems, progressWidth, setMobileMenuOpen,
    setShowUserMenu, handleLogout, closeMobileMenu,
  } = useHeaderState();

  return (
    <>
      <ScrollProgressBar scrollY={scrollY} progressWidth={progressWidth} />

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className={`mb-8 fixed ${hasMountedUser ? 'top-1' : 'top-0'} left-0 right-0 z-40 transition-all duration-300
          ${isScrolled
            ? 'bg-[var(--bg-light)]/95 backdrop-blur-xl shadow-lg shadow-[var(--accent-violet)]/10 border-b border-[var(--accent-violet)]/60'
            : 'bg-[var(--bg-light)]/90 backdrop-blur-md'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <HeaderLogo />
            <HeaderNavigation navItems={navItems} />
            <div className="hidden lg:flex items-center gap-2">
        

              <UserMenu
                user={user}
                userBadge={userBadge}
                mounted={mounted}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                handleLogout={handleLogout}
              />
            </div>

            <MobileHeaderActions
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </div>
        </div>
      </motion.header>

      <MobileMenu
        userBadge={userBadge}
        mobileMenuOpen={mobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
        navItems={navItems}
        handleLogout={handleLogout}
      />
    </>
  );
}