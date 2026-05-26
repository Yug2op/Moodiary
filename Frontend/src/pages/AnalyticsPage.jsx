// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, TrendingUp, Award, Calendar, Heart, TreeDeciduous } from "lucide-react";
import { analyticsAPI } from "../apis";
import { IconChartBar } from "@tabler/icons-react";

export default function AnalyticsPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trends"); 
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const scrollContainerRef = useRef(null);

  console.log(summaryData);

  // 1. Data Fetcher Handshake
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getSummary();
      if (res?.success) {
        setSummaryData(res);
      }
    } catch (err) {
      console.error("Failed to parse system analytics records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 2. Auto-scroll container to show the latest boxes on mount
  useEffect(() => {
    if (!loading && summaryData) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          container.scrollLeft = container.scrollWidth - container.clientWidth;
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [loading, summaryData]);

  // 3. Memoized Core Metric Pipelines (Preserves hook order rule metrics)
  const summary = useMemo(() => summaryData?.summary || {}, [summaryData]);
  const contributionMap = useMemo(() => summaryData?.contributionGrid || {}, [summaryData]);

  const curStreak = summary.currentStreak || 0;
  const maxStreak = summary.longestStreak || 0;
  const weekAvg = summary.weeklyAverage || 0;
  const monthAvg = summary.monthlyAverage || 0;

  const deltaVibe = weekAvg - monthAvg;
  const isTrendingUp = deltaVibe >= 0;

  const overallStatus = useMemo(() => {
    if (weekAvg >= 8) return { label: "Thriving", desc: "Your system metrics are operating at peak levels.", color: "text-emerald-400" };
    if (weekAvg >= 5) return { label: "Stable", desc: "You are maintaining a balanced mental baseline.", color: "text-amber-400" };
    return { label: "Heavy", desc: "Your indicators point to lower overall daily energies.", color: "text-rose-400" };
  }, [weekAvg]);

  // 4. Memoized Grid Pipelines
  const { gridDays, totalEntries } = useMemo(() => {
    const rawArray = Object.values(contributionMap);
    const processedDays = rawArray.map((day) => ({
      dateStr: day.date,
      rating: day.hasLogged && day.moodDetails ? Number(day.moodDetails.rating) : 0,
      moodDetails: day.moodDetails,
    }));
    const count = rawArray.filter((day) => day.hasLogged).length;
    return { gridDays: processedDays, totalEntries: count };
  }, [contributionMap]);

  // 5. Memoized Live Chart Trends Viewports
  const liveWeeklyTrends = useMemo(() => {
    const rawArray = Object.values(contributionMap).slice(-7);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return rawArray.map((day) => {
      const dateObj = new Date(day.date);
      const score = day.hasLogged && day.moodDetails ? Number(day.moodDetails.rating) * 10 : 0;
      return {
        day: dayNames[dateObj.getDay()],
        moodScore: score,
        status: day.hasLogged && day.moodDetails ? day.moodDetails.moodName || "Logged" : "No Entry",
        emoji: day.hasLogged && day.moodDetails ? day.moodDetails.emoji : "🪐"
      };
    });
  }, [contributionMap]);

  const liveMoodDistribution = useMemo(() => {
    const rawArray = Object.values(contributionMap);
    const totalLogsCount = rawArray.filter(day => day.hasLogged).length;
    const frequencyMap = {};

    rawArray.forEach(day => {
      if (day.hasLogged && day.moodDetails?.rating) {
        const name = day.moodDetails.rating;
        if (!frequencyMap[name]) {
          frequencyMap[name] = { mood: name, count: 0, emoji: day.moodDetails.emoji || "✨" };
        }
        frequencyMap[name].count += 1;
      }
    });

    return Object.values(frequencyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        ...item,
        percentage: totalLogsCount > 0 ? Math.round((item.count / totalLogsCount) * 100) : 0
      }));
  }, [contributionMap]);

  // 6. Simple AI Insight & Advice Prescription Engine
  const dynamicRecommendation = useMemo(() => {
    if (deltaVibe <= -1.0) {
      return {
        title: "Time to Rest and Recharge",
        desc: `Your mood this week is lower by ${Math.abs(deltaVibe).toFixed(1)} points compared to your usual month. You might be feeling stressed or tired.`,
        action: "What to do: Take a 30-minute break from your phone tonight. Drink enough water and try to get 8 hours of sleep to help your mind reset."
      };
    }
    if (deltaVibe >= 1.0) {
      return {
        title: "Great Energy Detected!",
        desc: `You are doing amazing! Your mood this week is +${deltaVibe.toFixed(1)} points better than your monthly average.`,
        action: "What to do: Use this good energy to do creative work, spend time with close friends, or write down what is making you feel so happy."
      };
    }
    if (weekAvg >= 7.5) {
      return {
        title: "Healthy & Steady Mood",
        desc: "Your mood is stable, balanced, and staying at a really good level.",
        action: "What to do: Keep doing what you are doing. Logging your mood daily and keeping up with your healthy habits is working perfectly."
      };
    }
    return {
      title: "Small Steps Protocol",
      desc: "Your mood is steady, but it is a bit lower than your usual best energy levels.",
      action: "What to do: Try something small to change your routine. Go for a quick 10-minute walk outside or send a text to check in with a close friend."
    };
  }, [deltaVibe, weekAvg]);

  // 7. Theme Gradient Evaluator
  const getContributionColor = (rating) => {
    if (!rating || rating === 0) return "bg-muted/30 border border-border/10";
    if (rating >= 9) return "bg-accent border border-accent/50 shadow-[0_0_8px_var(--color-accent)]";
    if (rating >= 7) return "bg-accent/60 border border-accent/40";
    if (rating >= 5) return "bg-primary border border-primary/50 shadow-[0_0_6px_var(--color-primary)]";
    if (rating >= 3) return "bg-primary/60 border border-primary/30";
    return "bg-primary/25 border border-primary/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-light tracking-widest opacity-80">Parsing data engine metrics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-28">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">

        {/* HEADER BRANDING */}
        <div className="border-b border-border/40 pb-4">
          <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Analytics Engine
          </h1>
          <p className="text-[11px] text-muted-foreground font-light mt-0.5">
            Historical diagnostic review patterns.
          </p>
        </div>

        {/* HIGH-VALUE CONTEXT STATUS BANNER */}
        <div className="bg-card border border-border/80 rounded-[1.5rem] p-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-primary/10 to-transparent blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Current State Vector</span>
              <h2 className={`text-base font-black ${overallStatus.color}`}>
                {overallStatus.label} ({weekAvg.toFixed(1)}/10)
              </h2>
              <p className="text-[11px] text-muted-foreground/90 font-light leading-relaxed max-w-[260px]">
                {overallStatus.desc}
              </p>
            </div>
          </div>
        </div>

        {/* PROACTIVE AI RECOMMENDATIONS */}
        <div className="bg-card border border-border rounded-[1.5rem] p-5 space-y-4 relative overflow-hidden shadow-xl group">
          <div className={`absolute top-0 left-0 h-full w-full opacity-[0.03] pointer-events-none transition-colors duration-500 ${
            deltaVibe <= -1.0 ? "bg-rose-500" : "bg-primary"
          }`} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Strategic Recommendation</span>
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
              {dynamicRecommendation.title}
            </h3>
            <p className="text-xs font-light text-muted-foreground/90 leading-relaxed">
              {dynamicRecommendation.desc}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-orange-500/30 bg-background space-y-1 relative z-10">
            <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 block">Prescription</span>
            <p className="text-[11px] font-normal text-foreground/90 leading-relaxed">
              {dynamicRecommendation.action}
            </p>
          </div>
        </div>

        {/* MIDDLE ADVANCED TILES MATRIX */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-3.5 rounded-2xl flex flex-col justify-between h-28 min-w-0 relative overflow-hidden">
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block font-light tracking-wide truncate leading-none">Streak Integrity</span>
              <span className="text-base font-black tracking-tight text-foreground mt-1 block truncate leading-tight">
                {curStreak}d <span className="text-[10px] font-light text-muted-foreground tracking-normal">/ {maxStreak}d peak</span>
              </span>
            </div>
            <div className="w-full space-y-1.5 shrink-0">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${maxStreak > 0 ? (curStreak / maxStreak) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground/80 font-light block truncate leading-none">
                {curStreak === maxStreak ? "Peak matched! 🔥" : `${maxStreak - curStreak}d to record`}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border p-3.5 rounded-2xl flex flex-col justify-between h-28 min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block font-light tracking-wide truncate leading-none">Timeline Indexes</span>
              <div className="text-[11px] font-light text-muted-foreground/90 mt-2 space-y-1">
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="truncate">7-Day:</span>
                  <strong className="text-foreground font-bold shrink-0">{weekAvg.toFixed(1)}</strong>
                </div>
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="truncate">30-Day:</span>
                  <strong className="text-foreground/80 font-semibold shrink-0">{monthAvg.toFixed(1)}</strong>
                </div>
              </div>
            </div>
            <span className="text-[8px] text-muted-foreground/60 font-light block border-t border-border/40 pt-1 truncate leading-none tracking-wide">
              Live cloud sync
            </span>
          </div>
        </div>

        {/* GITHUB STYLE CONTRIBUTION GRID COMPONENT */}
        <div className="bg-card border border-border rounded-[1.5rem] p-4 space-y-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-bold tracking-tight text-foreground/90">Consistency Grid</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-light">This Year ({totalEntries} logged)</span>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar pt-1" ref={scrollContainerRef}>
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start min-w-max py-1 px-0.5 select-none">
              {gridDays.map((day) => {
                const isSelected = selectedDay?.dateStr === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDay(day)}
                    className={`h-3 w-3 rounded-xs shrink-0 transition-all duration-150 outline-none border border-transparent cursor-pointer ${getContributionColor(day.rating)} ${
                      isSelected ? "scale-125 ring-2 ring-primary/60 shadow-lg z-10" : "active:scale-90 hover:scale-110"
                    }`}
                    type="button"
                    aria-label={`Log for ${day.dateStr}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground font-light pt-1 pr-1">
            <span>Low</span>
            <div className="h-2 w-2 rounded-xs bg-muted/30" />
            <div className="h-2 w-2 rounded-xs bg-primary/40" />
            <div className="h-2 w-2 rounded-xs bg-primary" />
            <div className="h-2 w-2 rounded-xs bg-accent" />
            <span>High</span>
          </div>
        </div>

        {/* CORE TIME AVERAGES STAT TILES SUMMARY */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-orange-500">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-muted-foreground font-light leading-none">Weekly Average</span>
              <span className="text-xl font-black tracking-tight text-foreground">{weekAvg.toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-muted-foreground font-light leading-none">Monthly Average</span>
              <span className="text-xl font-black tracking-tight text-foreground">{monthAvg.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* COGNITIVE SPECTRUMS CHART COMPONENT */}
        <div className="w-full rounded-[1.5rem] border border-border bg-card/50 text-card-foreground p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-48 w-48 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-border/40 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0">
                <IconChartBar className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs tracking-tight text-foreground/90 truncate leading-tight">Cognitive Spectrums</h3>
                <p className="text-[9px] text-muted-foreground/80 font-light truncate tracking-wide mt-0.5">Live mind analytics</p>
              </div>
            </div>
            <div className="flex rounded-xl bg-secondary/50 p-0.5 border border-border/10 shrink-0 select-none">
              <button
                onClick={() => setActiveTab("trends")}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all active:scale-95 ${
                  activeTab === "trends" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7d Flow
              </button>
              <button
                onClick={() => setActiveTab("distribution")}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all active:scale-95 ${
                  activeTab === "distribution" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dist
              </button>
            </div>
          </div>

          <div className="relative min-h-[180px] w-full pt-4 flex flex-col justify-end">
            <AnimatePresence mode="wait">
              {activeTab === "trends" && (
                <motion.div
                  key="live-trends"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col h-full justify-between"
                >
                  <div className="flex items-end justify-between gap-3 h-32 px-1">
                    {liveWeeklyTrends.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 group relative cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <AnimatePresence>
                          {hoveredIndex === index && data.moodScore > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: -10, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              className="absolute bottom-full z-30 mb-1 whitespace-nowrap rounded-lg bg-popover border border-border px-2 py-1 text-[9px] shadow-xl text-foreground"
                            >
                              <span className="font-bold text-primary capitalize">{data.status}</span> ({data.moodScore / 10}.0)
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="w-full bg-secondary/30 rounded-t-md relative overflow-hidden h-24 flex flex-col justify-end group-hover:bg-secondary/50 transition-colors duration-200">
                          {data.moodScore > 0 ? (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${data.moodScore}%` }}
                              transition={{ duration: 0.5, delay: index * 0.04, ease: "easeOut" }}
                              className="w-full bg-primary rounded-t-md opacity-85 group-hover:opacity-100 transition-opacity relative"
                              style={{ backgroundImage: "linear-gradient(to top, var(--color-primary), var(--color-accent))" }}
                            />
                          ) : (
                            <div className="w-full h-1 bg-muted/40 rounded-full mb-1" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-2 font-light tracking-tight flex flex-col items-center gap-0.5">
                          <span className="text-[9px] opacity-70 group-hover:opacity-100 transition-opacity">{data.moodScore > 0 ? data.emoji : "•"}</span>
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "distribution" && (
                <motion.div
                  key="live-distribution"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col space-y-3.5 pt-1"
                >
                  {liveMoodDistribution.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-muted-foreground font-light">
                      No historical entries recorded to calculate frequency models.
                    </div>
                  ) : (
                    liveMoodDistribution.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-light">
                          <span className="text-foreground/90 font-medium capitalize flex items-center gap-1.5">
                            <span>{item.emoji}</span>
                            <span>Rating: {item.mood}.0</span>
                          </span>
                          <span className="text-muted-foreground">{item.count} logs ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden border border-border/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-accent))" }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* DISMISSAL FOCUS BANNER FOOTER FOOTPRINT */}
        <div className="border border-border/80 bg-secondary/20 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground/90">Consistency Status</h4>
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
              Your streak is running at <strong className="text-amber-400 font-semibold">{curStreak} days</strong>. Keep registering your daily emotional checkpoints to preserve your data cloud matrices!
            </p>
          </div>
        </div>

      </div>

      {/* INTERACTIVE DAILY METRIC DETAILS DIALOG POPUP MODAL SCREEN LAYER */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xs bg-popover border border-border rounded-3xl p-5 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/10 blur-xl rounded-full pointer-events-none" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">Day Inspection Log</span>
              <h4 className="text-sm font-black text-foreground mt-1">
                {new Date(selectedDay.dateStr).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </h4>

              <div className="my-4 w-full text-left">
                {selectedDay.rating > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-secondary/40 border border-border/30 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-xl leading-none">{selectedDay.moodDetails?.emoji || "✨"}</span>
                        <span className="text-[9px] text-muted-foreground/80 font-light tracking-wide mt-1 truncate max-w-full capitalize">
                          {selectedDay.moodDetails?.moodName || "Logged"}
                        </span>
                      </div>
                      <div className="bg-secondary/40 border border-border/30 rounded-2xl p-2 col-span-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground/80 font-light tracking-wide uppercase">Day Rating</span>
                        <span className="text-lg font-black text-foreground tracking-tight mt-0.5">
                          {selectedDay.rating}.0<span className="text-[10px] font-normal text-muted-foreground/50">/10</span>
                        </span>
                      </div>
                    </div>
                    {selectedDay.moodDetails?.note && (
                      <div className="bg-secondary/20 border border-border/20 rounded-xl p-3 max-h-24 overflow-y-auto custom-scrollbar">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-primary block mb-1">Personal Reflection</span>
                        <p className="text-[11px] font-light text-foreground/90 leading-relaxed break-words">{selectedDay.moodDetails.note}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-secondary/20 border border-border/20 flex flex-col items-center justify-center text-center gap-1.5">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold">✕</div>
                    <div>
                      <span className="text-xs font-bold text-foreground/90 block">No entry registered</span>
                      <span className="text-[10px] text-muted-foreground/70 font-light block mt-0.5">This log day is currently blank</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="w-full h-9 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-98 transition-all shadow-md shadow-primary/10 cursor-pointer"
                type="button"
              >
                Dismiss View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}