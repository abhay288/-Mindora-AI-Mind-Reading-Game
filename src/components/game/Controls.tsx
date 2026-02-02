"use client";

import { useState, useEffect, useRef } from "react";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { useMindoraLogic } from "@/hooks/useMindoraLogic";
import { motion } from "framer-motion";

const answers = [
    { id: 'yes', label: 'Yes', labelHi: 'हाँ', color: 'text-emerald-600' },
    { id: 'no', label: 'No', labelHi: 'नहीं', color: 'text-rose-600' },
    { id: 'dont_know', label: 'Don\'t Know', labelHi: 'पता नहीं', color: 'text-slate-500' },
    { id: 'probably', label: 'Probably', labelHi: 'शायद', color: 'text-emerald-500' },
    { id: 'probably_not', label: 'Probably Not', labelHi: 'शायद नहीं', color: 'text-rose-500' },
] as const;

import { RotateCcw } from "lucide-react";

export function Controls() {
    const { language, updateConfidence, submitAnswer, setCharacterState, turnCount, undoStack, undoLastAction } = useGameStore();
    const { calculateNextConfidence } = useMindoraLogic();
    const startTimeRef = useRef(Date.now());

    // Reset timer on new question
    useEffect(() => {
        startTimeRef.current = Date.now();
    }, [turnCount]);

    const handleAnswer = (ansId: string) => {
        const timeTaken = Date.now() - startTimeRef.current;

        // 1. Calculate new confidence (mock logic)
        const newConf = calculateNextConfidence(ansId as any);

        // 2. Submit Answer with Timing
        submitAnswer(ansId, timeTaken);

        // 3. Optional: Reset character state after a delay if needed
        setTimeout(() => setCharacterState('idle'), 1500);
    };

    return (
        <div className="relative w-full">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                {answers.map((ans, idx) => (
                    <motion.div
                        key={ans.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className={ans.id === 'dont_know' ? "col-span-2 md:col-span-1" : ""}
                    >
                        <PulseButton
                            variant="option"
                            onClick={() => handleAnswer(ans.id)}
                            className={`w-full py-6 text-sm md:text-base ${ans.color}`}
                        >
                            {language === 'en' ? ans.label : ans.labelHi}
                        </PulseButton>
                    </motion.div>
                ))}
            </div>

            {/* FLOATING BACK BUTTON (Bottom Right - Akinator Style) */}
            {undoStack.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute -bottom-16 right-0 md:static md:mt-6 md:flex md:justify-end pointer-events-auto"
                >
                    <button
                        onClick={undoLastAction}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-full 
                                   bg-black/30 hover:bg-black/50 text-white/60 hover:text-white
                                   backdrop-blur-md border border-white/10 hover:border-white/20
                                   transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <RotateCcw className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-sm font-medium tracking-wide">
                            {language === 'en' ? "UNDO" : "वापस"}
                        </span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
