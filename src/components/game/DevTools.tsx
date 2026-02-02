
import React from 'react';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { SHOW_TELEMETRY_UI } from '@/lib/flags';

export const DevTools = () => {
    const { confidenceLog, confidence, sessionMemory } = useGameStore();

    // STRICT PROD CHECK & FEATURE FLAG
    if (process.env.NODE_ENV === 'production' || !SHOW_TELEMETRY_UI) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 p-4 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-xs font-mono text-cyan-400 w-64">
            <h3 className="uppercase tracking-widest mb-2 opacity-50">Neural Telemetry</h3>

            <div className="flex justify-between mb-2">
                <span>Conf: {(confidence * 100).toFixed(0)}%</span>
                <span>Streak: {sessionMemory.playCount}</span>
            </div>

            {/* Sparkline Graph */}
            <div className="relative h-16 w-full bg-black/50 rounded overflow-hidden flex items-end gap-1 p-1">
                {confidenceLog.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${val * 100}%` }}
                        className={`w-2 rounded-t-sm ${val > 0.8 ? 'bg-green-500' : val > 0.5 ? 'bg-cyan-500' : 'bg-indigo-500'
                            }`}
                    />
                ))}
            </div>

            <div className="mt-2 text-white/40">
                Turns: {confidenceLog.length} | Optimization Active
            </div>
        </div>
    );
};
