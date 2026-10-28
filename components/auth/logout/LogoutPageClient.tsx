'use client';
import { useLogoutPage } from "@/hooks/auth/logout/useLogoutPage";
import { motion } from "framer-motion";
import { Check, Loader2, LogOut, Shield, Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const checkVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1, transition: { delay: 0.15, type: "spring", stiffness: 220, damping: 18 } }
};

const CELEBRATION_STARS = 10;

export const SuccessState = () => (
  <motion.div
    key="success"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 text-center"
  >
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-xl shadow-green-500/40" />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div variants={checkVariants} initial="hidden" animate="visible">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[3]" />
        </motion.div>
      </div>

      {[0, 1].map((i) => (
        <motion.div key={i} className="absolute inset-0 border-3 border-green-400 rounded-full" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.8 + i * 0.4, opacity: 0 }} transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, ease: "easeOut" }} />
      ))}
    </motion.div>

    <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Déconnexion réussie !</motion.h2>
    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-slate-600 text-sm sm:text-base">À bientôt sur Mon Étoile ✨</motion.p>

    <div className="mt-5 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2">
      {Array.from({ length: CELEBRATION_STARS }, (_, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15, scale: 0 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.45 + i * 0.08, type: "spring", stiffness: 220 }}>
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const STARS_COUNT = 20;

export const StarField = () => {
  const [stars, setStars] = useState<Array<{
    id: number;
    style: { top: string; left: string };
    delay: number;
  }>>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: STARS_COUNT }, (_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        },
        delay: Math.random() * 2.5
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full"
          style={star.style}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 22, mass: 0.8 } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }
};
const iconPulse = {
  scale: [1, 1.08, 1],
  transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
};

export const LoadingState = ({ progress }: { progress: number }) => (
  <motion.div
    key="loading"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="theme-dark-panel rounded-2xl border border-white/20 bg-white/95 p-6 text-center shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-10 dark:bg-[#0F1C3F]/92"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      className="relative mx-auto mb-5 h-16 w-16 sm:mb-6 sm:h-20 sm:w-20"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2E5AA6] to-[#4F83D1] shadow-xl shadow-[#2E5AA6]/35 sm:rounded-3xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <LogOut className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Sparkles className="h-16 w-16 text-[#9BC2FF] sm:h-20 sm:w-20" />
      </motion.div>
    </motion.div>

    <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="theme-dark-title mb-2 text-xl font-bold text-slate-900 sm:mb-3 sm:text-2xl">Déconnexion en cours</motion.h2>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="theme-dark-muted mb-5 text-sm text-slate-600 sm:mb-7 sm:text-base">Sécurisation de votre session...</motion.p>

    <div className="mb-5 sm:mb-7">
      <div className="h-2 sm:h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <motion.div className="relative h-full rounded-full bg-gradient-to-r from-[#2E5AA6] via-[#4F83D1] to-[#9BC2FF]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <motion.div className="absolute inset-0 bg-white/30" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        </motion.div>
      </div>
      <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold">{progress}%</motion.p>
    </div>

    <div className="flex items-center justify-center gap-3 sm:gap-4 text-slate-400">
      {[
        { Icon: Shield, color: "text-blue-400" },
        { Icon: Zap, color: "text-yellow-400" },
        { Icon: Star, color: "text-[#9BC2FF]" }
      ].map(({ Icon, color }, i) => (
        <motion.div key={i} animate={iconPulse} transition={{ ...iconPulse.transition, delay: i * 0.15 }} className={color}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export const ErrorState = () => (
  <motion.div
    key="error"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 text-center"
  >
    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-xl shadow-orange-500/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 0.4, repeat: 3 }}>
          <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>
      </div>
    </div>

    <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Petite erreur...</motion.h2>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-600 text-sm sm:text-base mb-4 sm:mb-5">Redirection en cours...</motion.p>
    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2E5AA6] sm:h-6 sm:w-6" />
  </motion.div>
);

export default function LogoutPageClient() {
  const { progress, status } = useLogoutPage();

  const renderContent = (() => {
    switch (status) {
      case "loading": return <LoadingState progress={progress} />;
      case "success": return <SuccessState />;
      case "error": return <ErrorState />;
    }
  })();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#070B1A] via-[#0F1C3F] to-[#070B1A] p-3 sm:p-6">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#2E5AA6]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.15, 1, 1.15], rotate: [60, 0, 60] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#4F83D1]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-[#9BC2FF]/8 rounded-full blur-3xl"
        />
      </div>

      <StarField />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {renderContent}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mt-5 sm:mt-6 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-xs sm:text-sm font-medium shadow-lg hover:bg-white/15 transition-colors cursor-default"
          >
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Vos données sont protégées</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}