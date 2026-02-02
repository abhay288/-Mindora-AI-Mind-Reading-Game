"use client";

import { useState, useEffect } from "react";
import { NeuralBackground } from "@/components/layout/NeuralBackground";
import { Avatar } from "@/components/game/Avatar";
import { QuestionCard } from "@/components/game/QuestionCard";
import { Controls } from "@/components/game/Controls";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { PulseButton } from "@/components/ui/PulseButton";
import { RefreshCw } from "lucide-react";
import { ResultView } from "@/components/game/ResultView";
import { TeachView } from "@/components/game/TeachView";
import { GuessConfirmation } from "@/components/game/GuessConfirmation";
import { VictoryView } from "@/components/game/VictoryView";
import { DefeatView } from "@/components/game/DefeatView";

export default function GamePage() {
    const { gameState, resetGame, characterState, confidence, currentQuestion } = useGameStore();

    // Derive thinking state
    const isThinking = characterState === 'thinking' || (!currentQuestion && !gameState.includes('victory') && !gameState.includes('defeat'));

    // Watchdog: If stuck in loading state for > 5s, force reset
    // This prevents the "Infinite Spinner" if an API call gets lost
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isThinking && !currentQuestion) {
            timeout = setTimeout(() => {
                console.warn("Watchdog: Game stuck, forcing reset...");
                resetGame();
            }, 5000);
        }
        return () => clearTimeout(timeout);
    }, [isThinking, currentQuestion, resetGame]);

    return (
        <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
            <NeuralBackground />

            {/* Top Bar / reset */}
            <div className="absolute top-6 left-6 z-20">
                <button onClick={resetGame} className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <RefreshCw className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4 pt-16 md:p-8 items-center relative z-10 h-full">

                {/* LEFT COL: AVATAR STAGE (Cols 5) */}
                <div className="md:col-span-5 flex items-center justify-center relative min-h-[40vh] md:min-h-full order-1 md:order-1">
                    <Avatar isThinking={isThinking} confidence={confidence} />
                </div>

                {/* RIGHT COL: INTERACTION (Cols 7) */}
                {/* RIGHT COL: INTERACTION (Cols 7) */}
                <div className="md:col-span-7 flex flex-col justify-center w-full gap-8 order-2 md:order-2 pb-12 md:pb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={gameState}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-2xl mx-auto space-y-8"
                        >
                            {/* State Routing */}
                            {gameState === 'guessing' ? (
                                <GuessConfirmation />
                            ) : gameState === 'victory' ? (
                                <VictoryView />
                            ) : gameState === 'defeat' ? (
                                <DefeatView />
                            ) : gameState === 'teach' ? (
                                <TeachView />
                            ) : (
                                <>
                                    <QuestionCard />
                                    <Controls />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            {/* UI Layer */}
            {/* Telemetry Removed for Production */}
        </main>
    );
}
