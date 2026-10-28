'use client';
import React, { memo } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  options: readonly { value: string; label: string }[] | string[];
}

const RegisterSelectField = memo<SelectFieldProps>(({ label, name, value, onChange, error, options }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">
      {label} <span className="text-red-500">*</span>
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`
        w-full py-2.5 px-4 text-sm
        border-2 rounded-xl 
        theme-dark-input bg-white dark:bg-[color:var(--theme-layer-3)]
        transition-all duration-200
        ${error
          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500'
          : 'border-gray-200 dark:border-[color:var(--theme-border)] focus:border-blue-500 dark:focus:border-[#4F83D1]'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#4F83D1]/25
      `}
    >
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>
            {opt || 'Sélectionner'}
          </option>
        ) : (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )
      )}
    </select>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3" />
        {error}
      </motion.p>
    )}
  </div>
));

RegisterSelectField.displayName = 'RegisterSelectField';

export default RegisterSelectField;