"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NeuralBackground } from "@/components/layout/NeuralBackground";
import { LearningBadge } from "@/components/ui/LearningBadge";
import { PulseButton } from "@/components/ui/PulseButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useGameStore } from "@/lib/store";
import { Play, Volume2, Globe } from "lucide-react"; // Icons

export default function LandingPage() {
    const router = useRouter();
    const { language, setLanguage } = useGameStore();

    const handleStart = () => {
        // Play sound if enabled
        router.push("/select-theme");
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <NeuralBackground />

            <LearningBadge />

            {/* Top Controls - Shifted down to accommodate fixed badge */}
            <div className="absolute top-16 right-6 flex gap-4 z-50">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                    className="px-4 py-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md transition-all text-sm font-medium flex items-center gap-2 border border-white/20 dark:border-white/10"
                >
                    <Globe className="w-4 h-4 text-primary dark:text-primary-foreground" />
                    <span className="text-foreground">{language === 'en' ? 'EN' : 'HI'}</span>
                </button>
                <ThemeToggle />
            </div>

            <div className="z-10 flex flex-col items-center gap-8 text-center p-6 mt-12">
                {/* Character Avatar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative flex items-center justify-center"
                >
                    {/* Central Glow */}
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-75 animate-pulse-slow" />

                    {/* Orbit 1 (Inner) - Gold Planet */}
                    <div className="absolute w-[120%] h-[120%] rounded-full border border-primary/40 animate-[spin_12s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-secondary rounded-full shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
                    </div>

                    {/* Orbit 2 (Middle) - Teal Planet */}
                    <div className="absolute w-[160%] h-[160%] rounded-full border border-primary/30 animate-[spin_20s_linear_infinite_reverse]">
                        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-6 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(15,118,110,0.8)]" />
                    </div>

                    {/* Orbit 3 (Outer) - Accent Planet */}
                    <div className="absolute w-[210%] h-[210%] rounded-full border border-primary/20 animate-[spin_30s_linear_infinite]">
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 w-3 h-3 bg-accent-foreground rounded-full shadow-[0_0_10px_rgba(15,118,110,0.5)]" />
                        <div className="absolute top-1/2 right-0 translate-x-1/2 w-2 h-2 bg-secondary/50 rounded-full" />
                    </div>

                    <motion.img
                        src="/mindora-avatar.png"
                        alt="Mindora Character"
                        className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl relative z-10"
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

                {/* Logo Area */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl font-heading text-primary drop-shadow-sm">
                        Mindora
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                        {language === 'en' ? "Think of Something..." : "किसी चीज़ के बारे में सोचें..."}
                    </p>
                </motion.div>

                {/* Play Action */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <PulseButton
                        onClick={handleStart}
                        className="px-12 py-6 text-2xl shadow-xl shadow-primary/20"
                        pulse={true}
                    >
                        <Play className="w-6 h-6 mr-3 fill-current" />
                        {language === 'en' ? "START" : "शुरू करें"}
                    </PulseButton>
                </motion.div>
            </div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-6 text-xs text-muted-foreground/60">
                © 2026 Mindora AI • Neural Engine v2.0
            </div>
        </main>
    );
}
