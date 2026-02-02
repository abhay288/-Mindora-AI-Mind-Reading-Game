"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";

export function GuessConfirmation() {
    const { language, guessResult, confirmGuess } = useGameStore();

    return (
        <GlassCard className="w-full text-center p-8 md:p-12 space-y-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
            >
                <div className="text-primary text-xl font-medium uppercase tracking-widest">
                    {language === 'en' ? "I am thinking of..." : "मैं सोच रहा हूँ..."}
                </div>

                <h2 className="text-5xl md:text-6xl font-heading text-primary drop-shadow-sm">
                    {guessResult?.name || "???"}
                </h2>

                <p className="text-muted-foreground italic">
                    {guessResult?.description}
                </p>
            </motion.div>

            <div className="flex flex-col gap-4 items-center">
                <p className="text-sm opacity-60 uppercase tracking-widest">
                    {language === 'en' ? "Is this correct?" : "क्या यह सही है?"}
                </p>
                <div className="flex gap-4">
                    <PulseButton onClick={() => confirmGuess(true)} variant="primary" className="px-8 bg-emerald-600 hover:bg-emerald-500">
                        {language === 'en' ? "YES" : "हाँ"}
                    </PulseButton>
                    <PulseButton onClick={() => confirmGuess(false)} variant="secondary" className="px-8 bg-rose-600 hover:bg-rose-500">
                        {language === 'en' ? "NO" : "नहीं"}
                    </PulseButton>
                </div>
            </div>
        </GlassCard>
    );
}
