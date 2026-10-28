"use client";
import CacheLink from '@/components/commons/CacheLink';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Lock, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ForbiddenPage() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 14, stiffness: 100 },
    },
  };

  const lockPulse = {
    scale: [1, 1.08, 1],
    rotate: [0, -4, 4, -4, 0],
    transition: { duration: 3, repeat: Infinity, repeatType: "reverse" as const },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0812] via-[#180D2E] to-[#070B1A] px-6 text-center">
      {/* Étoiles de fond */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{ width: star.size, height: star.size, left: `${star.x}%`, top: `${star.y}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: star.duration, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </div>

      {/* Halo rouge */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(200,50,80,0.35) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
      />

      <motion.div
        className="relative z-10 max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Star className="w-4 h-4 text-[#FFD600] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9BC2FF]">
              Mon Étoile
            </span>
          </div>
        </motion.div>

        {/* Icône cadenas animé */}
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <motion.div
            animate={lockPulse}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-red-700/40 to-red-500/20 border border-red-400/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(200,50,80,0.3)]"
          >
            <Lock className="w-12 h-12 text-red-400" />
          </motion.div>
        </motion.div>

        {/* Code 403 */}
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="text-7xl font-black text-white sm:text-8xl">
            4
            <span className="text-red-400">0</span>
            3
          </h1>
        </motion.div>

        {/* Message principal */}
        <motion.h2
          variants={itemVariants}
          className="mb-3 text-xl font-bold text-[#DDE7FA] sm:text-2xl"
        >
          Accès Refusé
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="mb-2 text-sm leading-relaxed text-[#D1D5DB] sm:text-base"
        >
          Tu n&apos;as pas les permissions nécessaires pour accéder à cette zone.
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mb-8 text-xs text-[#9BA3AF]"
        >
          Si tu penses qu&apos;il s&apos;agit d&apos;une erreur, contacte un administrateur.
        </motion.p>

        {/* Boutons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <CacheLink
            href="/star/profil"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2E5AA6] to-[#4F83D1] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
            Mon Profil
          </CacheLink>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-[#DDE7FA] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Page précédente
          </button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}