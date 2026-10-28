'use client';
import { config } from '@/lib/config';
import { useAuth } from '@/lib/hooks';
import { dispatchLoginNavigation } from '@/lib/navigation/clientNavigation';
import { AnimatePresence } from 'framer-motion';
import React, { memo, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Sparkles, Star, Zap } from 'lucide-react';

const particleVariants = {
  float: (custom: number) => ({
    y: [0, -20, 0],
    x: [0, custom * 5, 0],
    opacity: [0, 1, 0],
    scale: [0.8, 1.15, 0.8],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: custom * 0.2,
    },
  }),
};

interface FloatingParticleProps {
  Icon: React.ElementType;
  delay: number;
  x: string;
  y: string;
  color: string;
}

const FloatingParticle = memo<FloatingParticleProps>(({ Icon, delay, x, y, color }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    custom={delay}
    variants={particleVariants}
    animate="float"
  >
    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
  </motion.div>
));

interface ShieldOrbitProps {
  radius: number;
  duration: number;
  reverse?: boolean;
  dotClassName?: string;
}

const ShieldOrbit = memo<ShieldOrbitProps>(
  ({ radius, duration, reverse = false, dotClassName = 'bg-violet-300 shadow-violet-400/50' }) => (
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full shadow-lg ${dotClassName}`}
        style={{
          transform: `translate(-50%, -50%) translateY(-${radius}px)`,
        }}
      />
    </motion.div>
  )
);

interface LoadingRingProps {
  delay: number;
  duration: number;
  size: string;
  borderClassName: string;
  arcColor: string;
}

const LoadingRing = memo<LoadingRingProps>(
  ({ delay, duration, size, borderClassName, arcColor }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className={`absolute ${size} rounded-full border-2 sm:border-4 ${borderClassName}`}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent sm:border-4"
        style={{
          borderTopColor: arcColor,
          borderRightColor: arcColor,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  )
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const glowVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [0.25, 0.55, 0.25],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const CosmicLoader = memo(() => (
  <div
    className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br
      from-[#12061D] via-[#24103A] to-[#090511]"
  >
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.12, 0.24, 0.12],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.18, 0.08],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.06, 0.14, 0.06],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/15 blur-3xl sm:h-[32rem] sm:w-[32rem]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%)]" />
    </div>

    <FloatingParticle Icon={Star} delay={0} x="15%" y="20%" color="text-violet-300" />
    <FloatingParticle Icon={Sparkles} delay={1} x="85%" y="25%" color="text-fuchsia-300" />
    <FloatingParticle Icon={Zap} delay={2} x="20%" y="75%" color="text-indigo-300" />

    <FloatingParticle Icon={Star} delay={1.5} x="80%" y="70%" color="text-violet-200" />
    <FloatingParticle Icon={Sparkles} delay={0.5} x="10%" y="50%" color="text-purple-200" />
    <FloatingParticle Icon={Zap} delay={2.5} x="90%" y="45%" color="text-amber-200" />

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="z-10 text-center"
    >
      <div className="relative mx-auto mb-8 h-40 w-40 sm:h-48 sm:w-48">
        <motion.div
          variants={glowVariants}
          animate="pulse"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-indigo-400/25 blur-2xl"
        />

        <LoadingRing
          delay={0}
          duration={3}
          size="inset-0"
          borderClassName="border-violet-300/20"
          arcColor="rgba(196, 181, 253, 0.95)"
        />
        <LoadingRing
          delay={0.1}
          duration={4}
          size="inset-3"
          borderClassName="border-fuchsia-300/20"
          arcColor="rgba(244, 114, 182, 0.9)"
        />
        <LoadingRing
          delay={0.2}
          duration={5}
          size="inset-6"
          borderClassName="border-indigo-300/20"
          arcColor="rgba(129, 140, 248, 0.88)"
        />

        <motion.div
          variants={{
            hidden: { scale: 0, rotate: -180 },
            visible: {
              scale: 1,
              rotate: 0,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                duration: 0.6,
              },
            },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full bg-violet-500 blur-xl"
            />

            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-[1.4rem]
                bg-gradient-to-br from-violet-600 via-fuchsia-500 to-purple-500
                shadow-2xl shadow-violet-500/40 sm:h-24 sm:w-24"
            >
              <Shield className="h-10 w-10 text-white sm:h-12 sm:w-12" />
              <Lock className="absolute h-5 w-5 text-white/90 sm:h-6 sm:w-6" />
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />
            </div>
          </div>
        </motion.div>

        <ShieldOrbit radius={70} duration={4} dotClassName="bg-violet-300 shadow-violet-400/50" />
        <ShieldOrbit radius={80} duration={5} reverse dotClassName="bg-fuchsia-300 shadow-fuchsia-400/50" />
        <ShieldOrbit radius={90} duration={6} dotClassName="bg-amber-200 shadow-amber-300/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="space-y-3"
      >
        <motion.h2
          className="text-2xl font-black tracking-tight sm:text-3xl"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundImage:
              'linear-gradient(90deg, #c4b5fd, #e879f9, #fde68a, #c4b5fd)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Protection spirituelle en cours
        </motion.h2>

        <motion.p
          className="text-sm font-medium text-violet-100/80 sm:text-base"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Shield className="mr-2 inline h-4 w-4" />
          Harmonisation et sécurisation de votre espace
        </motion.p>

        <div className="flex items-center justify-center gap-2 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: ['#8B5CF6', '#E879F9', '#FDE68A', '#8B5CF6'],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-10 space-y-2 sm:mt-12"
      >
        {[
          { icon: Shield, text: 'Activation du cercle de protection', delay: 0 },
          { icon: Lock, text: 'Scellage énergétique de la session', delay: 0.3 },
          { icon: Sparkles, text: 'Ouverture de votre espace sacré', delay: 0.6 },
        ].map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: step.delay,
              duration: 0.5,
              type: 'spring',
              stiffness: 300,
            }}
            className="flex items-center justify-center gap-3 text-xs text-violet-100/80 sm:text-sm"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: step.delay,
              }}
            >
              <step.icon className="h-4 w-4" />
            </motion.div>

            <span>{step.text}</span>

            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: step.delay,
              }}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </div>
));

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

function ProtectedRouteComponent({
  children,
  redirectTo = config.routes.login,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  const loginUrl = useMemo(() => {
    if (typeof window === 'undefined') return redirectTo;
    const currentUrl = window.location.pathname + window.location.search;
    return `${redirectTo}?returnTo=${encodeURIComponent(currentUrl)}`;
  }, [redirectTo]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const [, query = ''] = loginUrl.split('?');
      const params = new URLSearchParams(query);

      dispatchLoginNavigation(params.get('returnTo') || undefined);
    }
  }, [isAuthenticated, isLoading, loginUrl]);

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <CosmicLoader />
      </AnimatePresence>
    );
  }

  if (!isAuthenticated) { return null; }

  return <>{children}</>;
}

export const ProtectedRoute = memo(ProtectedRouteComponent, (prev, next) => {
  return prev.redirectTo === next.redirectTo;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute; 