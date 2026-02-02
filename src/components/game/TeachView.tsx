"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function TeachView() {
    const { language, guessResult, resetGame } = useGameStore();
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState("");

    const handleTeachSubmit = async () => {
        // Simplified Learning: just the name
        try {
            await fetch('/api/mindora/teach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wrongGuessId: guessResult?.id,
                    newCharacter: { name },
                    // Backend handles pattern update and weight adjustments automatically
                })
            });
        } catch (e) {
            console.error("Teach submit failed", e);
        }

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <GlassCard className="w-full text-center p-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-500 rounded-full blur-xl opacity-50"
                        />
                        <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-5 rounded-full text-white relative z-10 shadow-lg shadow-emerald-500/30">
                            <Sparkles className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-heading bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {language === 'en' ? "Thank you!" : "धन्यवाद!"}
                        </h2>
                        <p className="text-lg text-white/80">
                            {language === 'en' ? "I’ll remember this for next time 😊" : "मैं अगली बार इसे याद रखूँगा 😊"}
                        </p>
                    </div>

                    <div className="pt-4">
                        <PulseButton onClick={resetGame} variant="primary" className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-none shadow-lg shadow-emerald-500/20">
                            {language === 'en' ? "Play Again" : "फिर से खेलें"}
                        </PulseButton>
                    </div>
                </motion.div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="w-full max-w-lg mx-auto p-8 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-heading text-primary">
                    {language === 'en' ? "Teach Me" : "मुझे सिखाओ"}
                </h2>
                <p className="text-sm text-white/60">
                    {language === 'en' ? "Help me get smarter for the next run." : "अगली बार के लिए मुझे बेहतर बनाने में मदद करें।"}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold ml-1 mb-2 block">
                        {language === 'en' ? "Who were you thinking of?" : "आप किसके बारे में सोच रहे थे?"}
                    </label>
                    <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-lg transition-all placeholder:text-white/20"
                        placeholder="e.g. Harry Potter, Shah Rukh Khan, PewDiePie"
                        autoFocus
                    />
                </div>

                <div className="pt-2">
                    <PulseButton
                        onClick={handleTeachSubmit}
                        disabled={!name.trim()}
                        className={`w-full py-4 text-lg font-bold transition-all duration-300 ${name.trim() ? 'bg-linear-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] border-none text-white' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        {language === 'en' ? "Submit Learning" : "सब्मिट करें"}
                    </PulseButton>
                </div>
            </div>
        </GlassCard>
    );
}
