// src/pages/MoodEntryPage.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Heart, Smile, MessageSquare } from "lucide-react";
import { analyticsAPI, moodAPI } from "../apis";
// 🎯 FIX: Explicitly import your new timezone-safe generator utility
import { getStandardizedToday } from "../utils/getStandardizedToday"; 

const MOOD_PRESETS = [
  {
    rating: 10,
    label: "Overjoyed",
    emoji: "🌟",
    color: "border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
  },
  {
    rating: 9,
    label: "Energetic",
    emoji: "🔥",
    color: "border-pink-500 text-pink-400 bg-pink-500/10 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
  },
  {
    rating: 8,
    label: "Super Happy",
    emoji: "🌸",
    color: "border-emerald-500 text-emerald-400 bg-emerald-500/10"
  },
  {
    rating: 7,
    label: "Feeling Good But Tired",
    emoji: "😎",
    color: "border-teal-500 text-teal-400 bg-teal-500/10"
  },
  {
    rating: 6,
    label: "Alright / Neutral",
    emoji: "🏖️",
    color: "border-cyan-500 text-cyan-400 bg-cyan-500/10"
  },
  {
    rating: 5,
    label: "Just Okay / Steady",
    emoji: "😔",
    color: "border-slate-400 text-slate-300 bg-slate-400/10"
  },
  {
    rating: 4,
    label: "Overthinking / Uneasy",
    emoji: "🧠",
    color: "border-amber-500 text-amber-400 bg-amber-500/10"
  },
  {
    rating: 3,
    label: "Feeling Down",
    emoji: "🌧️",
    color: "border-orange-500 text-orange-400 bg-orange-500/10"
  },
  {
    rating: 2,
    label: "Annoyed / Irritated",
    emoji: "💢",
    color: "border-red-500 text-red-400 bg-red-500/10"
  },
  {
    rating: 1,
    label: "Totally Drained",
    emoji: "🪫",
    color: "border-rose-700 text-rose-400 bg-rose-900/20"
  },
];

export default function MoodEntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Core Form Processing Hooks
  const [rating, setRating] = useState(6);
  const [moodName, setMoodName] = useState("Calm");
  const [emoji, setEmoji] = useState("😌");
  const [note, setNote] = useState("");

  // 🎯 FIX: Unified timezone-safe anchor initialization mapping
  const todayStr = useMemo(() => getStandardizedToday(), []);

  // 1. Handshake Grid to match if an entry exists for today
  const checkExistingLog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getSummary();

      if (res?.success && res?.contributionGrid) {
        const grid = res.contributionGrid;
        
        // 🎯 FIX: Repaired the evaluation arrow function syntax and omitted the broken bracket leak blocks
        const existingToday = Object.values(grid).find(day => day.date === todayStr && day.hasLogged);

        // ⚡ Move the check to the top so it only runs if we actually have an entry!
        if (existingToday && existingToday.moodDetails) {
          setIsEditMode(true);
          setRating(Number(existingToday.moodDetails.rating || 6));
          setEmoji(existingToday.moodDetails.emoji || "😌");

          const rawSavedNote = existingToday.moodDetails.note || "";

          if (rawSavedNote.includes(":")) {
            // 1. Extract the clean Status Label (Everything before the first ":")
            const cleanMoodName = rawSavedNote.split(":")[0].trim();
            setMoodName(cleanMoodName || "Calm");

            // 2. Extract the clean Reflection Note text (Everything after the first ":")
            const cleanNoteText = rawSavedNote.substring(rawSavedNote.indexOf(":") + 1).trim();
            setNote(cleanNoteText);
          } else {
            // Fallback configuration if the saved text doesn't contain a colon pattern
            setMoodName(existingToday.moodDetails.moodName || "Calm");
            setNote(rawSavedNote);
          }
        } else {
          setIsEditMode(false); // Clean fallback configuration statement hook
        }
      }
    } catch (err) {
      console.error("Failed to sync current date checkpoints:", err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    checkExistingLog();
  }, [checkExistingLog]);

  // 2. Handle interactive preset selection taps
  const handlePresetSelect = (preset) => {
    setRating(preset.rating);
    setMoodName(preset.label);
    setEmoji(preset.emoji);
  };

  // 3. Dispatch data update events payload to backend API engine
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    try {
      setSubmitting(true);

      const payload = {
        date: todayStr,
        rating,
        emoji,
        note: `${moodName}: ${note.trim()}`
      };
      await moodAPI.createOrUpdateMood(payload);

      navigate("/feed");
    } catch (err) {
      console.error("Submission vector registration rejected:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-light tracking-widest opacity-80">Syncing database node spectrums...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-12 select-none">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">

        {/* TOP INTERACTIVE ACTION BAR BUTTON HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-border/30">
          <button
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-xl border border-border/40 bg-secondary/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black tracking-tight text-foreground/90">
              {isEditMode ? "Update Today's Mood" : "Add Today's Mood"}
            </h1>
            <p className="text-[9px] text-muted-foreground font-light tracking-wider uppercase mt-0.5">
              Today • {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="w-8 h-8 opacity-0" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* STEP A: THE QUICK TOUCH TAP PRESET GRID MATRIX (2x5 Grid Setup) */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
              <Smile className="h-3 w-3 text-primary" /> Your mood as emoji
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {MOOD_PRESETS.map((preset) => {
                const isActive = rating === preset.rating;
                return (
                  <button
                    key={preset.rating}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-2 px-1 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-150 active:scale-95 min-w-0 cursor-pointer ${isActive
                      ? `${preset.color} ring-1 ring-primary/40 font-bold scale-105 shadow-md`
                      : "border-border/40 bg-card text-muted-foreground/70 opacity-80"
                    }`}
                  >
                    <span className="text-base leading-none">{preset.emoji}</span>
                    <span className="text-[8px] tracking-tight mt-1 font-semibold truncate w-full max-w-full block capitalize">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP B: THE MANUAL MICRO SLIDER TUNER CARD BLOCK */}
          <div className="bg-card border border-border/80 rounded-[1.5rem] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-accent" /> Your mood level 
              </span>
              <span className="text-xs font-black text-foreground bg-secondary/60 border border-border/20 px-2 py-0.5 rounded-md shrink-0">
                {rating}.0 / 10
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => {
                const value = Number(e.target.value);
                setRating(value);
                const matchedPreset = MOOD_PRESETS.find(p => p.rating === value);
                if (matchedPreset) {
                  setMoodName(matchedPreset.label);
                  setEmoji(matchedPreset.emoji);
                }
              }}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <div className="flex items-center justify-between text-[8px] text-muted-foreground/60 px-0.5 font-light">
              <span>Low (1)</span>
              <span>Neutral (5)</span>
              <span>High (10)</span>
            </div>
          </div>

          {/* STEP C: LIVE LABEL NAME INTERACTION CELL ROW SLOTS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border p-3 rounded-xl space-y-0.5 min-w-0">
              <span className="text-[8px] text-muted-foreground block uppercase font-bold">Your Mood</span>
              <input
                type="text"
                value={moodName}
                onChange={(e) => setMoodName(e.target.value)}
                className="w-full bg-transparent text-[8px] font-bold text-foreground focus:outline-hidden border-b border-transparent focus:border-primary/40 pb-0.5 capitalize truncate"
              />
            </div>
            <div className="bg-card border border-border p-3 rounded-xl space-y-0.5 min-w-0">
              <span className="text-[8px] text-muted-foreground block uppercase font-bold">Emoji</span>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-hidden text-center"
              />
            </div>
            <div className="bg-card border border-border p-3 rounded-xl flex flex-col justify-center text-center opacity-70 min-w-0">
              <span className="text-[8px] text-muted-foreground block uppercase font-bold">Entry Type</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-wider mt-0.5 truncate">
                {isEditMode ? "Rewrite" : "Fresh"}
              </span>
            </div>
          </div>

          {/* STEP D: REFLECTION TEXTAREA ENTRY BOX BLOCK */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
              <MessageSquare className="h-3 w-3 text-primary" /> Your Mood Reflection
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What events or choices directed this daily energy baseline?"
              rows="4"
              className="w-full bg-card/60 border border-border rounded-2xl p-3.5 text-xs font-light text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40 focus:border-transparent leading-relaxed placeholder:text-muted-foreground/50 resize-none"
              maxLength="300"
            />
            <div className="text-right text-[8px] text-muted-foreground/60 tracking-wide font-light pr-1">
              {note.length} / 300 char limit
            </div>
          </div>

          {/* CRITICAL CORE ACTION EVENT DISPATCHER FORM BUTTON */}
          <div className="w-full pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 font-bold text-xs tracking-wide text-white shadow-lg shadow-primary/10 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-background"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <span>
                  {isEditMode ? "Update mood entry" : "Add mood entry"}
                </span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}