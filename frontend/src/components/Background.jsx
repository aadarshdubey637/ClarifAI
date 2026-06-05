import React from 'react';
import { motion } from 'framer-motion';

export const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-ai-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ai-secondary/20 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-ai-accent/5 blur-[160px]" />

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] right-[15%] w-64 h-64 border border-white/5 rounded-3xl rotate-12 backdrop-blur-3xl"
      />
      
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[20%] left-[10%] w-48 h-48 border border-white/5 rounded-full backdrop-blur-2xl"
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
    </div>
  );
};
