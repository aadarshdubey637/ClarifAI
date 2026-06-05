import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({ label, type = 'text', placeholder, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      {label && <label className="text-[14px] font-bold text-[#0F172A] block">{label}</label>}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2.5 px-4 transition-all duration-200 outline-none focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] placeholder:text-slate-400 text-[15px] text-[#0F172A] hover:border-[#FF8A00]/50"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};
