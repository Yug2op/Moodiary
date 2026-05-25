import React from "react";
import { motion } from "framer-motion";
import {
    Smile,
    Flame,
    BarChart3,
    BrainCircuit,
    ShieldCheck,
    Sparkles,
    Feather
} from "lucide-react"; // Using Lucide React icons

export default function FeaturesSection() {
    const features = [
        {
            icon: <Smile className="h-6 w-6 text-purple-400" />,
            title: "Intelligent Mood Logging",
            description: "Capture how you feel in seconds with intuitive, color-coded emotional mapping designed to bypass writing friction."
        },
        {
            icon: <Flame className="h-6 w-6 text-orange-400" />,
            title: "Mindfulness Streaks",
            description: "Build a consistent self-care habit. Watch your emotional resilience grow as you lock in daily check-ins."
        },
        {
            icon: <BarChart3 className="h-6 w-6 text-pink-400" />,
            title: "Emotional Analytics",
            description: "Uncover hidden patterns with comprehensive charts tracking weekly mood swings, triggers, and progressive shifts."
        },
        {
            icon: <BrainCircuit className="h-6 w-6 text-blue-400" />,
            title: "AI-Powered Insights",
            description: "Get personalized, deep breakdowns explaining what factors and times of day correlate with your peak mental clarity."
        },
        {
            icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
            title: "Vault-Grade Privacy",
            description: "Your raw thoughts belong solely to you. Your logs are completely encrypted and secure from external visibility."
        },
        {
            icon: <Sparkles className="h-6 w-6 text-yellow-400" />,
            title: "Calming Modern UI",
            description: "Immerse yourself in a beautiful, minimalist, and ad-free workspace carefully tailored to soothe your focus."
        }
    ];

    // Container animation variant for staggering the cards
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="w-full bg-background py-20 px-4 sm:px-6 lg:px-8" id="features">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center text-center mb-6 md:mb-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium border border-border">
                        <Feather className="h-3.5 w-3.5 text-primary" /> What We Offer
                    </span>
                </div>

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
                        Everything you need to <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">understand your mind</span>
                    </h2>
                    <p className="mt-4 text-neutral-400 font-light">
                        Moodiary simplifies emotional reflection into smart, actionable components that track mental wellness effortlessly.
                    </p>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{ y: -5, borderColor: "rgba(139, 92, 246, 0.4)" }}
                            className="relative overflow-hidden rounded-2xl border border-border bg-background/40 p-6 backdrop-blur-xl transition-colors duration-300 hover:bg-background/80"
                        >
                            {/* Subtle background glow effect on card hover */}
                            <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl transition-all duration-300 group-hover:bg-purple-500/10" />

                            {/* Icon Container */}
                            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-slate-800/80 p-3 shadow-inner">
                                {feature.icon}
                            </div>

                            {/* Text Elements */}
                            <h3 className="text-lg font-medium text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-neutral-400 font-light">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
}