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
    " emotions.",
    " thoughts.",
    " patterns.",
  ];

  const isLoggedIn = localStorage?.getItem('isLoggedIn') === 'true';
  
  return (
    <>
    {isLoggedIn && (
      <BottomNavbar/>
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
  <div className="hidden fixed inset-y-0 left-0 w-px bg-border md:block">
    <div className="absolute top-0 h-screen w-px bg-gradient-to-b from-transparent via-violet-500 to-transparent" />
  </div>

  <div className="hidden fixed inset-y-0 right-0 w-px bg-border md:block">
    <div className="absolute h-screen w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent" />
  </div>

  {/* Main Section - Centered cleanly on mobile viewports using flex growth */}
  <section className="relative z-10 mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-6 py-8 text-center md:py-28 md:flex-initial">

    {/* Heading */}
    <h1 className="mx-auto max-w-6xl font-light tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-7xl leading-[1.2] md:leading-tight">
      Your emotions deserve a space. Track your{" "}
      <FlipWords
        words={words}
        duration={2000}
      />
    </h1>

    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.4,
      }}
      className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg md:mt-8 md:text-xl"
    >
      Moodiary helps you capture your emotions daily with beautiful mood
      tracking, streak systems, emotional insights, and a calming modern
      experience designed for your mind.
    </motion.p>

    {/* CTA Buttons - Adjusted margins to look intentional on compact screens */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.6,
      }}
      className="mt-8 flex flex-col items-center justify-center gap-3.5 w-full sm:flex-row sm:w-auto sm:gap-4"
    >
      <button 
        className="group w-full rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] px-8 py-3.5 font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
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