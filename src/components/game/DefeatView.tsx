"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, RefreshCw } from "lucide-react";

export function DefeatView() {
    const { language, setGameState, resetGame } = useGameStore();

    return (
        <GlassCard className="w-full text-center p-12 space-y-8 border-amber-500/30 bg-amber-500/5">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
            >
                <div className="text-amber-500 text-xl font-bold uppercase tracking-widest">
                    {language === 'en' ? "You Defeated Me!" : "आपने मुझे हरा दिया!"}
                </div>

                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {language === 'en'
                        ? "I don't know who you are thinking of. Help me learn so I can win next time."
                        : "मुझे नहीं पता कि आप किसके बारे में सोच रहे हैं। मुझे सीखने में मदद करें ताकि मैं अगली बार जीत सकूं।"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-sm mx-auto">
                    <PulseButton onClick={() => setGameState('teach')} variant="primary" className="gap-2 w-full">
                        <GraduationCap className="w-4 h-4" />
                        {language === 'en' ? "Teach Me" : "सिखाओ"}
                    </PulseButton>

                    <PulseButton onClick={() => alert("Report Mock")} variant="ghost" className="gap-2 w-full border border-white/10">
                        <AlertTriangle className="w-4 h-4" /> Report
                    </PulseButton>
                </div>

                <div className="pt-8">
                    <button onClick={resetGame} className="text-sm opacity-50 hover:opacity-100 flex items-center justify-center gap-2 mx-auto transition-opacity">
                        <RefreshCw className="w-3 h-3" /> Play Again
                    </button>
                </div>
            </motion.div>
        </GlassCard>
    );
}
