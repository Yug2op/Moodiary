// src/components/FeedCard.jsx
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Flame } from "lucide-react";
import { Meteors } from "@/components/ui/meteors"; 
import LazyEmojiPicker from "./LazyEmojiPicker";
import ReactMarkdown from 'react-markdown';

// 💡 ADDED `currentUserId` to the destructured props
export default function FeedCard({ 
  post, 
  currentUserId, 
  activeReactionTray, 
  setActiveReactionTray, 
  onReactionToggle 
}) {
  if (!post || !post.user) return null;

  // Clean string conversion of the viewer's ID
  const viewerId = currentUserId?.toString() || "";

  const getRatingStyles = (rating) => {
    if (rating >= 8) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
    if (rating >= 5) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  // Group real-time reaction records
  const groupedReactions = (post.reactions || []).reduce((acc, current) => {
    if (!current.emoji) return acc;
    if (!acc[current.emoji]) {
      acc[current.emoji] = { emoji: current.emoji, count: 0, users: [] };
    }
    acc[current.emoji].count += 1;
    
    // Track who reacted
    const reactorId = current.user?._id ? current.user._id.toString() : current.user?.toString();
    if (reactorId) {
      acc[current.emoji].users.push(reactorId);
    }
    
    return acc;
  }, {});

  return (
    <div className="relative w-full max-w-md mx-auto group">
      <div className="absolute inset-0 h-full w-full scale-[0.92] transform rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl transition-all duration-500 group-hover:scale-[0.98] group-hover:opacity-25" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card/70 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:border-border/80"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={post.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                alt={post.user?.username}
                className="h-10 w-10 rounded-xl object-cover bg-muted border border-border/80 relative z-10"
              />
              {post.user?.currentStreak > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-black border border-card shadow-lg z-20">
                  <Flame className="h-2 w-2 fill-current" />
                  {post.user.currentStreak}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight text-foreground/90">
                @{post.user?.username}
              </h3>
              <p className="text-[10px] text-muted-foreground/90 font-light mt-0.5 flex items-center gap-1">
                <span>{post.emoji}</span>
                <span className="capitalize tracking-wide">{post.note?.split(":")[0] || ""}</span>
              </p>
            </div>
          </div>

          <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border tracking-tighter relative z-10 ${getRatingStyles(post.rating)}`}>
            {post.rating}.0
          </span>
        </div>

        {post.note && (
          <div className="prose prose-stone relative z-10 text-xs font-light text-foreground/85 leading-relaxed pl-0.5 mt-4 mb-2">
            <ReactMarkdown>{post.note}</ReactMarkdown>
          </div>
        )}

        <div className="relative z-10 pt-3 mt-auto border-t border-border/40 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveReactionTray(activeReactionTray === post._id ? null : post._id)}
            className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all border ${
              activeReactionTray === post._id
                ? "bg-primary/20 border-primary text-primary"
                : "bg-secondary/80 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smile className="h-3.5 w-3.5" />
          </button>

          {(() => {
            const badges = Object.values(groupedReactions);
            const sortedBadges = badges.sort((a, b) => b.count - a.count);
            const visibleBadges = sortedBadges.slice(0, 4);
            const overflowCount = sortedBadges.length - 4;

            return (
              <>
                {visibleBadges.map((reaction) => {
                  // 🎯 FIX: Checking against the logged-in viewer's ID now!
                  const hasMeReacted = reaction.users.includes(viewerId);
                  
                  return (
                    <button
                      key={reaction.emoji}
                      onClick={() => onReactionToggle(post._id, reaction.emoji)}
                      className={`h-7 px-2.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-medium transition-all active:scale-95 ${
                        hasMeReacted
                          ? "bg-primary/25 border-primary text-primary scale-105 shadow-md font-bold"
                          : "bg-secondary/50 border-border/60 text-foreground/90 hover:bg-secondary/80"
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span className={`text-[10px] ${hasMeReacted ? "text-primary font-black" : "text-muted-foreground"}`}>
                        {reaction.count}
                      </span>
                    </button>
                  );
                })}

                {overflowCount > 0 && (
                  <div className="h-7 px-2.5 rounded-xl border border-border bg-secondary/30 text-[10px] text-muted-foreground/80 flex items-center justify-center font-normal tracking-wide">
                    +{overflowCount} more
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <Meteors number={10} />
      </motion.div>
      
      {createPortal(
        <AnimatePresence>
          {activeReactionTray === post._id && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-xs z-40"
                onClick={() => setActiveReactionTray(null)}
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-popover border-t border-border rounded-t-[2rem] shadow-2xl z-50 overflow-hidden flex flex-col items-center pb-safe"
              >
                <div className="w-10 h-1 bg-muted rounded-full my-3.5" />
                <div className="w-full px-4 pb-4">
                  <LazyEmojiPicker
                    moodId={post._id}
                    onSelect={(id, emoji) => {
                      onReactionToggle(id, emoji);
                      setActiveReactionTray(null);
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}