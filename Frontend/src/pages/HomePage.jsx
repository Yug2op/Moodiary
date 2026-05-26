"use client";
import React from 'react'
import { motion } from "framer-motion";

import {
  Smile,
  Flame,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Home
} from "lucide-react";
import { BackgroundBeams } from '@/components/ui/background-beams';
import { FlipWords } from '@/components/ui/flip-words';
import FeaturesSection from '@/components/FeaturesSection';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import StreakSection from '@/components/StreakSection';
import FooterCTA from '@/components/FooterCTA';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '@/components/BottomNavbar';

const HomePage = () => {
  const navigate = useNavigate();


  const words = [
    "emotions.",
    "thoughts.",
    "patterns.",
  ];

  const isLoggedIn = localStorage?.getItem('isLoggedIn') === 'true';

  return (
    <>
      {isLoggedIn && (
        <BottomNavbar />
      )}
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col justify-center md:block">
        <BackgroundBeams />

        {/* Background Glow - Scaled down for mobile to prevent overflow, optimized for desktop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[-30%] top-[-5%] h-[15rem] w-[15rem] rounded-full bg-gray-500/10 blur-3xl md:left-[-10%] md:top-[-10%] md:h-[30rem] md:w-[30rem]" />
          <div className="absolute bottom-[-5%] right-[-30%] h-[15rem] w-[15rem] rounded-full bg-pink-500/10 blur-3xl md:right-[-10%] md:bottom-[-10%] md:h-[30rem] md:w-[30rem]" />
          <div className="absolute left-[10%] top-[40%] h-[12rem] w-[12rem] rounded-full bg-orange-500/5 blur-3xl md:left-[40%] md:top-[30%] md:h-[20rem] md:w-[20rem]" />
        </div>

        {/* Side Borders - Hidden on mobile, visible on desktop */}
        <div className="fixed inset-y-0 left-0 w-px bg-border md:block">
          <div className="absolute top-0 h-screen w-px bg-gradient-to-b from-transparent via-violet-500 to-transparent" />
        </div>

        <div className="fixed inset-y-0 right-0 w-px bg-border md:block">
          <div className="absolute h-screen w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent" />
        </div>

        {/* Main Section - Centered cleanly on mobile viewports using flex growth */}
        <section className="relative z-10 mx-auto flex max-w-7xl flex-1 flex-col items-center justify-start px-6 py-8 text-center md:py-12 md:flex-initial">


          {/* Modern Glassmorphism Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-orange-400/80 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-orange-400/80 md:mb-8"
          >
            {/* Animated Ping Indicator */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background opacity-75 dark:bg-background"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-background dark:bg-background"></span>
            </span>

            {/* Pill Text */}
            <span className="tracking-wider uppercase text-background dark:text-background font-semibold text-[10px] sm:text-xs">
              Introducing Moodiary
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="relative z-10 mx-auto max-w-6xl font-light tracking-tight text-lg sm:text-4xl md:text-5xl lg:text-7xl leading-[1.3] md:leading-tight text-foreground dark:text-foreground">
            {/* Line 1: Clear block layout forces this onto its own line everywhere */}
            <span className="block whitespace-nowrap mb-1 md:mb-2 ">
              Your emotions deserve a space.
            </span>

            {/* Line 2: Combines "Track your" and the animated words seamlessly */}
            <span className="inline-flex flex-nowrap justify-center items-center">
              <span>Track your {" "}</span>
              <FlipWords
                words={words}
                duration={2000}
                className="inline-block font-semibold text-accent"
              />
            </span>
          </h1>

          {/* NEW CONTENT AREA: Micro-Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 grid grid-cols-2 gap-3 max-w-lg w-full text-left sm:grid-cols-3 sm:max-w-2xl"
          >
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white/5 backdrop-blur-sm dark:border-neutral-800/60">
              <span className="text-base sm:text-lg">📊</span>
              <h3 className="text-xs font-semibold mt-1 text-foreground">Color Spectrum</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">Visualize your inner state over a fluid dynamic scale.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white/5 backdrop-blur-sm dark:border-neutral-800/60">
              <span className="text-base sm:text-lg">⚡</span>
              <h3 className="text-xs font-semibold mt-1 text-foreground">Consistency Grid</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">Form positive validation loops with streak mapping.</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-neutral-200 bg-white/5 backdrop-blur-sm dark:border-neutral-800/60 text-center sm:text-left">
              <span className="text-base sm:text-lg">🔒</span>
              <h3 className="text-xs font-semibold mt-1 text-foreground">Secure Reflections</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">Your personal logs are private and secure.</p>
            </div>
          </motion.div>

          {/* NEW CONTENT AREA: Quick App Stats Badge Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-6 flex items-center justify-center gap-6 border-y border-neutral-200/40 dark:border-neutral-800/40 py-3 w-full max-w-md"
          >
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">100%</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Private</div>
            </div>
            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">0s</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Friction</div>
            </div>
            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">1-Tap</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Check-in</div>
            </div>
          </motion.div>

          {/* CTA Buttons - Adjusted margins to look intentional on compact screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
            className="mt-6 flex flex-col items-center justify-center gap-3.5 w-full sm:flex-row sm:w-auto sm:gap-4"
          >
            <button
              className="group w-full rounded-2xl border-1 border-background bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] px-8 py-3.5 font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              onClick={() => navigate("/auth")}
            >
              Start Your Journey
            </button>
          </motion.div>
        </section>
      </div>
      <div>
        <FeaturesSection />
        <AnalyticsDashboard />
        <StreakSection />
        <FooterCTA />
      </div>
    </>
  );
}

export default HomePage