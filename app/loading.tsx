"use client";
import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const Loader = memo(function Loader() {
  const reduce = useReducedMotion();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#EEF4FF] via-[#DDE7FA] to-indigo-50 dark:from-[#070B1A] dark:via-[#0F1C3F] dark:to-slate-900" />
      <div className="absolute -z-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-40 dark:opacity-30 bg-[radial-gradient(circle_at_center,rgba(46,90,166,0.35),rgba(79,131,209,0.20),transparent_65%)]" />

      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "w-full max-w-xs rounded-3xl border",
          "border-[#4F83D1]/20 dark:border-white/10",
          "bg-white/80 dark:bg-slate-950/70",
          "backdrop-blur-xl",
          "shadow-[0_18px_60px_rgba(0,0,0,0.10)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
          "px-5 py-6",
          "flex flex-col items-center justify-center text-center gap-3",
        ].join(" ")}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="h-[3px] w-20 rounded-full bg-gradient-to-r from-[#2E5AA6] via-[#4F83D1] to-indigo-500/90 opacity-90" />

        <div className="relative grid place-items-center">
          <div className="absolute h-16 w-16 rounded-full opacity-30 animate-pulse bg-gradient-to-r from-[#4F83D1] via-[#9BC2FF] to-indigo-400 dark:from-[#2E5AA6] dark:via-[#4F83D1] dark:to-indigo-700" />
          <div className="h-12 w-12 rounded-full border-[3px] border-transparent border-t-[#2E5AA6] dark:border-t-[#9BC2FF] border-r-[#4F83D1]/70 dark:border-r-[#9BC2FF]/70 animate-spin" />

          <motion.svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            className="absolute text-[#2E5AA6] dark:text-[#DDE7FA]"
            initial={reduce ? undefined : { y: 0, scale: 1 }}
            animate={reduce ? undefined : { y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={reduce ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" opacity="0.18" />
            <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2" opacity="0.45" />
            <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.95" />
          </motion.svg>
        </div>

        <div className="space-y-1">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 6 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-[14px] sm:text-[15px] font-extrabold tracking-tight text-[#16315F] dark:text-[#DDE7FA]"
          >
            Chargement cosmique…
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 6 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="text-[12px] leading-snug text-slate-600 dark:text-slate-300/85"
          >
            Préparation de vos données, merci de patienter.
          </motion.div>

          <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[#2E5AA6]/70 dark:bg-[#9BC2FF]/70"
                initial={reduce ? undefined : { opacity: 0.35, scale: 0.9 }}
                animate={reduce ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 1.05, repeat: Infinity, ease: "easeInOut", delay: i * 0.14 }
                }
              />
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
});

export default Loader;
