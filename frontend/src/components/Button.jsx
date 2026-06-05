import React from 'react';
import { clsx } from 'clsx';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: "bg-[#0B1222] text-white hover:bg-[#1a2333] transition-colors",
    outline: "bg-white border border-brand-border text-brand-dark hover:bg-slate-50 transition-colors"
  };

  return (
    <button
      className={clsx(
        "w-full py-2.5 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 text-[15px]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
