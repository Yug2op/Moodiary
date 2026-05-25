import React from "react";
import { Sparkles } from "lucide-react";


export default function FooterCTA() {
  return (
    <section className="w-full bg-background text-foreground py-16 px-4 sm:px-6 border-t border-border/40">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-muted/40 border border-border/80 p-8 md:p-12 text-center relative overflow-hidden shadow-inner">
        
        {/* Decorative background visual blob */}
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2 text-primary mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
            Give your thoughts the <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">space they deserve</span>
          </h2>
          <p className="text-sm font-light text-muted-foreground max-w-md mx-auto">
            Join thousands of individuals tracking their mood patterns, mastering their habits, and building sustainable clarity.
          </p>
          <div className="pt-4">
            <button className="rounded-xl px-6 py-3 text-xs font-medium text-secondary bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f97316] transition-all duration-200 hover:opacity-95 hover:scale-103 animate-bounce shadow-lg shadow-primary/20 active:scale-[0.98]">
              Create Your Free Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}