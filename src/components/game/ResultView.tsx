"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { RefreshCw, GraduationCap } from "lucide-react";

export function ResultView() {
    const { language, resetGame, guessResult } = useGameStore();

    return (
        <GlassCard className="w-full text-center p-8 md:p-12 space-y-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <div className="text-primary text-xl font-medium uppercase tracking-widest">
                    {language === 'en' ? "I am thinking of..." : "मैं सोच रहा हूँ..."}
                </div>

                <h2 className="text-5xl md:text-6xl font-heading text-secondary drop-shadow-sm">
                    {guessResult?.name || "???"}
                </h2>

                <p className="text-muted-foreground italic">
                    {guessResult?.description}
                </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8">
                <PulseButton onClick={resetGame} variant="primary" pulse>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === 'en' ? "Play Again" : "फिर से खेलें"}
                </PulseButton>

                <PulseButton onClick={() => useGameStore.getState().setGameState('teach')} variant="ghost" className="text-primary">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {language === 'en' ? "Not Correct? Teach Me" : "सही नहीं? मुझे सिखाओ"}
                </PulseButton>
            </div>
        </GlassCard>
    );
}
