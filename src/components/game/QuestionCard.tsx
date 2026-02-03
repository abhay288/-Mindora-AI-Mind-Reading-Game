"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { PulseButton } from "@/components/ui/PulseButton";
import { useEffect, useState } from "react"; // Added useEffect and useState

export function QuestionCard() {
    // Modified destructuring of useGameStore
    const { gameState, currentQuestion, language, submitAnswer, characterState, turnCount, errorMessage, isLoading, forceRecovery } = useGameStore();
    const [displayQuestion, setDisplayQuestion] = useState(""); // Added useState for displayQuestion

    // Added useEffect to select random variant
    useEffect(() => {
        if (!currentQuestion) {
            // TIMEOUT SAFEGUARD: If stuck in loading or null for > 2.5s, force recovery
            const timer = setTimeout(() => {
                if (process.env.NODE_ENV === 'development') console.warn("Mindora Recovery Triggered via Timeout");
                forceRecovery();
            }, 2500);
            return () => clearTimeout(timer);
        }

        const q = currentQuestion;
        let text = language === 'en' ? q.text.en : q.text.hi; // Use language for initial text

        // Semantic Personality: Pick a variant if available
        // Only apply variants if the current question is not an error state and has variants
        if (gameState !== 'error' && q.variants && q.variants.length > 0 && Math.random() > 0.3) {
            const idx = Math.floor(Math.random() * q.variants.length);
            text = language === 'en' ? q.variants[idx].en : q.variants[idx].hi; // Use language for variant text
        }

        setDisplayQuestion(text);
    }, [currentQuestion, language, gameState, forceRecovery]); // Added language and gameState to dependencies

    // Fallback/Error State handled as "Deep Thinking" or "Confused"
    if (gameState === 'error' || (!currentQuestion && !isLoading && gameState === 'playing')) {
        return (
            <GlassCard className="w-full min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center text-center p-6 md:p-12 shadow-2xl border-cyan-500/20">
                <div className="text-cyan-400 font-bold mb-2 animate-pulse">Hmm… thinking 🤔</div>
                <div className="text-sm text-cyan-300/60 font-mono p-4 max-w-md">
                    {language === 'en' ? "Just connecting a few dots..." : "कड़ियों को जोड़ रहा हूँ..."}
                </div>
                {/* Manual Retry Button */}
                <button
                    onClick={() => window.location.reload()} // Hard reset for now, or retry action if available
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs uppercase tracking-wider transition-colors"
                >
                    Reconnect
                </button>
            </GlassCard>
        );
    }

    if (!currentQuestion) {
        return (
            <GlassCard className="w-full min-h-[160px] md:min-h-[200px] flex items-center justify-center text-center p-6 md:p-12 shadow-2xl">
                <div className="animate-pulse text-primary/50 text-sm md:text-base">
                    {language === 'en' ? "Consulting Neural Net..." : "न्यूरल नेट से परामर्श..."}
                </div>
            </GlassCard>
        );
    }

    // Use dynamic question text from API
    const questionText = language === 'en' ? currentQuestion.text.en : currentQuestion.text.hi;

    return (
        <GlassCard className="w-full min-h-[200px] flex items-center justify-center text-center p-8 md:p-12 shadow-2xl relative group">



            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 max-w-2xl mx-auto"
                >
                    <div className="question-header mb-1">
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary/40 block">
                            {language === 'en' ? `Question #${turnCount}` : `प्रश्न #${turnCount}`}
                        </span>
                    </div>

                    {displayQuestion !== questionText && (
                        <h3 className="text-xl md:text-2xl font-medium text-center text-white min-h-16 flex items-center justify-center">
                            {displayQuestion}
                        </h3>
                    )}
                    <h2 className="text-3xl md:text-5xl font-heading text-primary leading-tight drop-shadow-sm">
                        {questionText}
                    </h2>
                </motion.div>
            </AnimatePresence>
        </GlassCard>
    );
}
