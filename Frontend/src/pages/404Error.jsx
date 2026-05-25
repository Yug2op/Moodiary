// src/pages/NotFoundPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft, Home, HelpCircle } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-72 w-72 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Main Structural Container */}
      <div className="text-center max-w-md w-full px-4 space-y-8 flex flex-col items-center">
        
        {/* Floating Core Icon Engine */}
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="h-24 w-24 rounded-[2rem] bg-card border border-border flex items-center justify-center text-primary shadow-2xl relative"
        >
          <Compass className="h-10 w-10 stroke-[1.5]" />
          {/* Decorative mini badge indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] font-bold text-primary-foreground items-center justify-center">!</span>
          </span>
        </motion.div>

        {/* Text Headers */}
        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground/40 select-none"
          >
            404
          </motion.h1>
          <h2 className="text-xl font-light tracking-tight">
            Lost in your internal <span className="text-primary font-normal">coordinates</span>?
          </h2>
          <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
            This space doesn't exist or the emotional milestone record link was unlinked from the database cluster.
          </p>
        </div>

        {/* Quick Action Navigation Buttons Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full space-y-2.5 pt-4"
        >
          {/* Action A: Return to Safety Panel */}
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-xs font-medium transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Step Back Offline
          </button>

          {/* Action B: Route Directly to Landing Root */}
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium transition-all active:scale-[0.98] shadow-lg shadow-primary/10 hover:opacity-95"
          >
            <Home className="h-3.5 w-3.5" />
            Return to Home
          </button>
        </motion.div>

        {/* Micro Footer Context */}
        <div className="pt-8 flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-light select-none">
          <HelpCircle className="h-3 w-3" />
          <span>Need architectural guidance? contact systems admin.</span>
        </div>

      </div>
    </div>
  );
}