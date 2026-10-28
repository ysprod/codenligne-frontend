'use client';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const toastVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast = ({ message, onClose }: ErrorToastProps) => (
  <motion.div
    variants={toastVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="fixed bottom-4 right-4 z-50 max-w-sm"
  >
    <div className="bg-red-500/95 dark:bg-red-600/95 backdrop-blur-sm text-white rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3 border border-red-400/30">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{message}</p>
      </div>      
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-150"
        aria-label="Fermer"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  </motion.div>
);

export default ErrorToast;