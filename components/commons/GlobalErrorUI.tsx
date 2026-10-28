'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

interface GlobalErrorUIProps {
  error: Error & { digest?: string };
  reset: () => void;
  isGlobalError?: boolean;
}

export default function GlobalErrorUI({ error, reset, isGlobalError = false }: GlobalErrorUIProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/');
    router.refresh();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-[#0F1C3F] to-[#070B1A] p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#4F83D1]/10"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-full blur-xl opacity-50"
              />
              <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-6">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
          >
            {isGlobalError ? 'Erreur Critique' : 'Une erreur est survenue'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-200 text-center mb-6 text-lg"
          >
            {isGlobalError
              ? "Une erreur critique s'est produite. L'application doit être rechargée."
              : "Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer."}
          </motion.p>

          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 bg-red-950/50 border border-red-500/30 rounded-xl p-4 overflow-auto max-h-48"
            >
              <p className="text-red-300 font-mono text-sm break-all">
                <strong>Message:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-red-400 font-mono text-xs mt-2">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {!isGlobalError && (
              <>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2E5AA6] to-[#4F83D1] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#244A8A] hover:to-[#3E6FB5] hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  Réessayer
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
              </>
            )}

            <button
              onClick={handleGoHome}
              className={`flex items-center justify-center gap-2 px-6 py-3 ${isGlobalError
                ? 'bg-gradient-to-r from-[#2E5AA6] to-[#4F83D1] hover:from-[#244A8A] hover:to-[#3E6FB5]'
                : 'bg-white/10 hover:bg-white/20 border border-white/20'
                } text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              <Home className="w-5 h-5" />
              Accueil
            </button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-400 text-sm mt-8"
          >
            Si le problème persiste, veuillez contacter le support technique au +225 07 58 38 53 87 .
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}