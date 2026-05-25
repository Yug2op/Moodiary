import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  Brain 
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("trends"); // "trends" | "distribution"
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Mock Data using contextual descriptions
  const weeklyTrends = [
    { day: "Mon", moodScore: 60, status: "Neutral" },
    { day: "Tue", moodScore: 40, status: "Anxious" },
    { day: "Wed", moodScore: 85, status: "Radiant" },
    { day: "Thu", moodScore: 70, status: "Calm" },
    { day: "Fri", moodScore: 90, status: "Joyful" },
    { day: "Sat", moodScore: 95, status: "Excellent" },
    { day: "Sun", moodScore: 80, status: "Peaceful" },
  ];

  const moodDistribution = [
    { mood: "Radiant", percentage: 35, count: 11, variance: "up" },
    { mood: "Calm", percentage: 28, count: 9, variance: "stable" },
    { mood: "Neutral", percentage: 18, count: 5, variance: "down" },
    { mood: "Anxious", percentage: 12, count: 3, variance: "down" },
    { mood: "Low", percentage: 7, count: 2, variance: "down" },
  ];

  return (
    <section className="w-full bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Header Block */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground px-3 py-1 text-xs font-medium border border-border">
            <Activity className="h-3.5 w-3.5 text-primary" /> Deep Insights
          </span>
          <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">
            Turn raw thoughts into <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">clear patterns</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm font-light text-muted-foreground sm:text-base">
            Beautiful, actionable breakdowns reveal exactly what triggers your peak mental clarity and emotional baselines.
          </p>
        </div>

        {/* Outer Dashboard Card Wrapper */}
        <div className="w-full rounded-[1.5rem] border border-border bg-card text-card-foreground p-4 shadow-xl backdrop-blur-xl md:p-8">
          
          {/* Top Bar Controls */}
          <div className="flex flex-col gap-4 pb-6 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">Your Workspace Summary</h3>
                <p className="text-xs text-muted-foreground">May 2026 • 30 Day Streak Active</p>
              </div>
            </div>

            {/* Tab Toggles */}
            <div className="flex rounded-xl bg-muted p-1 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("trends")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "trends"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Weekly Flow
              </button>
              <button
                onClick={() => setActiveTab("distribution")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "distribution"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Distribution
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 py-6 md:grid-cols-4 md:gap-4">
            {[
              { label: "Dominant Mood", value: "Calm", meta: "28% of logs" },
              { label: "Weekly Avg Score", value: "77/100", meta: "+12% vs last week" },
              { label: "Optimal Time", value: "7:00 AM", meta: "Highest clarity logs" },
              { label: "Logged Days", value: "24/30", meta: "80% completion" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3.5 md:p-4">
                <p className="text-xs text-muted-foreground font-light">{stat.label}</p>
                <p className="text-lg font-medium tracking-tight mt-1 text-foreground sm:text-xl">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-light mt-0.5 flex items-center gap-0.5">
                  <ArrowUpRight className="h-2.5 w-2.5 text-primary inline" /> {stat.meta}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Visualizations Canvas */}
          <div className="relative min-h-[240px] w-full bg-muted/20 rounded-2xl border border-border/40 p-4 flex flex-col justify-end">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: WEEKLY TRENDS (Bar Graph Line Simulation) */}
              {activeTab === "trends" && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col h-full justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground font-light flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Emotional Flow Scale (0-100)
                    </span>
                  </div>

                  {/* Graph Columns */}
                  <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
                    {weeklyTrends.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 group relative cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Dynamic Tooltip on Hover */}
                        <AnimatePresence>
                          {hoveredIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: -12, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              className="absolute bottom-full z-30 mb-2 whitespace-nowrap rounded-lg bg-popover text-popover-foreground border border-border px-2.5 py-1 text-[11px] shadow-md"
                            >
                              <span className="font-medium text-primary">{data.status}</span> ({data.moodScore})
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Interactive Data Bar */}
                        <div className="w-full bg-secondary/60 rounded-t-md relative overflow-hidden h-32 flex flex-col justify-end group-hover:bg-secondary transition-colors duration-200">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${data.moodScore}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                            className="w-full bg-primary rounded-t-md opacity-85 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-2 font-light">{data.day}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: MOOD DISTRIBUTION MATRIX */}
              {activeTab === "distribution" && (
                <motion.div
                  key="distribution"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col space-y-3.5"
                >
                  {moodDistribution.map((item, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-light">
                        <span className="text-foreground font-medium">{item.mood}</span>
                        <span className="text-muted-foreground">{item.count} logs ({item.percentage}%)</span>
                      </div>
                      
                      {/* Full-width Bar Track */}
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
                          className="h-full bg-accent-foreground rounded-full opacity-80"
                          style={{
                            // Mimic accent/primary blend dynamically safely
                            backgroundImage: "linear-gradient(to right, var(--primary), var(--accent-foreground))"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}