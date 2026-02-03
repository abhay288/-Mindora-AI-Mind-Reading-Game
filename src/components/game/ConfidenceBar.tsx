"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";

export function ConfidenceBar() {
    const { confidence } = useGameStore();

    // Smooth physics-based spring animation
    return (
        <div className="w-full max-w-xs mx-auto mt-6">
            <div className="flex justify-between text-xs text-white/40 mb-1 uppercase tracking-widest">
                <span>Unsure</span>
                <span>Confident</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 relative">
                <motion.div
                    className="h-full bg-linear-to-r from-cyan-500 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.max(5, confidence * 100)}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
            </div>
        </div>
    );
}
