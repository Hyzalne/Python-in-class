import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InputGroupProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearError?: () => void;
  required?: boolean;
  step?: string;
  error?: string;
  tooltip?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  type = "number",
  placeholder,
  icon,
  value,
  onChange,
  onClearError,
  required = true,
  step = "any",
  error,
  tooltip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-4 relative">
      <div className="flex items-center gap-1.5 mb-1">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        {tooltip && (
          <div 
            className="relative flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <HelpCircle size={12} className="text-gray-400 cursor-help hover:text-agro-green transition-colors" />
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-agro-dark text-white text-[10px] rounded-xl shadow-xl z-50 pointer-events-none"
                >
                  <div className="relative">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-agro-dark rotate-45 -mb-1" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      <div className={`flex items-center bg-agro-input rounded-[15px] px-4 py-3 transition-all focus-within:ring-2 ${error ? 'ring-2 ring-red-500/50' : 'focus-within:ring-agro-accent/20'}`}>
        {icon && <div className={`${error ? 'text-red-500' : 'text-agro-accent'} mr-3 w-5 flex justify-center`}>{icon}</div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={step}
          className="bg-transparent border-none outline-none w-full font-bold text-[#2D3436] placeholder:text-gray-400 text-sm"
        />
      </div>
      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-600 px-3 py-1.5 rounded-lg mt-1.5 border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] font-bold leading-tight">
            {error}
          </p>
          {onClearError && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onClearError();
              }}
              className="ml-2 p-0.5 hover:bg-red-100 rounded-full transition-colors"
              title="Bỏ qua thông báo"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
