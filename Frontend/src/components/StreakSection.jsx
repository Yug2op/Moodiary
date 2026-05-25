import React from "react";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, Bell, Trophy } from "lucide-react";

export default function StreakSection() {
  const weekDays = [
    { day: "M", active: true, current: false },
    { day: "T", active: true, current: false },
    { day: "W", active: true, current: false },
    { day: "T", active: true, current: false },
    { day: "F", active: true, current: false },
    { day: "S", active: true, current: true }, // Today
    { day: "S", active: false, current: false },
  ];

  return (
    <section className="w-full bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 border-t border-border/40">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left Side: Content */}
        <div className="space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium border border-border">
            <Flame className="h-3.5 w-3.5 text-primary animate-pulse" /> Daily Momentum
          </span>
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
            Built to make consistency <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">effortless</span>
          </h2>
          <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 sm:text-base">
            Overcoming tracking burnout is hard. Moodiary leverages gentle micro-reminders and milestones to transform self-reflection into a rewarding daily ritual.
          </p>

          <div className="space-y-4 max-w-md mx-auto lg:mx-0 text-left">
            {[
              { icon: <Bell className="text-primary" />, t: "Smart Nudges", d: "Custom alerts that adapt intelligently around your daily routines." },
              { icon: <Trophy className="text-primary" />, t: "Milestone Levels", d: "Unlock clean profile insights as your streak milestones progress." }
            ].map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="p-2 bg-muted rounded-xl mt-0.5">{item.icon}</div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{item.t}</h4>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Card Grid Visual */}
        <div className="bg-card text-card-foreground border border-border rounded-[1.5rem] p-6 shadow-xl max-w-md mx-auto w-full relative overflow-hidden">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground font-light">Current Streak</p>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground mt-0.5 flex items-center gap-1.5">
                12 Days <Flame className="h-5 w-5 text-primary fill-primary/20" />
              </h3>
            </div>
            <span className="text-[10px] uppercase bg-muted px-2.5 py-1 rounded-md font-semibold tracking-wider text-muted-foreground">
              Level 3 Mind
            </span>
          </div>

          {/* Week Matrix Tracker Row */}
          <div className="grid grid-cols-7 gap-2 py-6">
            {weekDays.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-xs font-light text-muted-foreground">{item.day}</span>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                    item.current 
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                      : item.active 
                        ? "border-border bg-secondary/40 text-primary" 
                        : "border-border/40 bg-muted/20 text-muted-foreground/40"
                  }`}
                >
                  {item.active ? <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> : <span className="text-xs font-light">•</span>}
                </motion.div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-center text-xs font-light text-muted-foreground">
            🎉 Log today to start in your <span className="font-medium text-foreground"> daily streak bonus</span>!
          </div>
        </div>

      </div>
    </section>
  );
}