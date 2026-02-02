"use client";

import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";

interface AvatarProps {
    isThinking: boolean;
    confidence?: number; // New: 0.0 to 1.0
}

// Placeholder imports - in reality these would be JSONs
// import idleAnim from "@/public/animations/avatar-idle.json";
// import thinkingAnim from "@/public/animations/avatar-thinking.json";

export function Avatar({ isThinking, confidence = 0 }: AvatarProps) {

    // Determine State based on Confidence
    // < 0.50: Confused (Head tilt / small swirl)
    // 0.50 - 0.70: Thinking (Pulse dots)
    // 0.70 - 0.85: Smile (Soft glow)
    // > 0.85: Victory (Sparkle burst)

    let glowColor = "shadow-cyan-500/50";
    let scale = 1;
    let rotation = 0;

    if (confidence > 0.85) {
        // Victory
        glowColor = "shadow-green-400/90";
        scale = 1.2;
    } else if (confidence > 0.70) {
        // Smile / Confident
        glowColor = "shadow-cyan-400/80";
        scale = 1.1;
    } else if (confidence > 0.50) {
        // Thinking
        glowColor = "shadow-blue-500/60";
        scale = 1.05;
    } else {
        // Confused / Neutral
        glowColor = "shadow-indigo-500/40";
        rotation = -5; // Tilt
    }

    // Mock animation data logic - normally strict paths
    const animData = null;

    // Emotional Micro-Harmony Cues
    // 40-60: Soft Pulse | 60-80: Glow | 80-95: Micro Nod | >95: Sparkle
    const getHarmonyClass = (conf: number) => {
        if (conf > 0.95) return "animate-sparkle drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]";
        if (conf > 0.80) return "animate-nod drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]";
        if (conf > 0.60) return "animate-pulse-slow drop-shadow-[0_0_8px_rgba(0,100,255,0.4)] transition-all duration-1000";
        if (conf > 0.40) return "animate-pulse-subtle opacity-90";
        return "opacity-80";
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={false}
                animate={isThinking ? { scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(59, 130, 246, 0.4)", "0 0 40px rgba(59, 130, 246, 0.7)", "0 0 20px rgba(59, 130, 246, 0.4)"] } : {
                    scale: [1, 1.02, 1], // Always breathe slightly
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: 0,
                    boxShadow: `0 0 30px ${confidence > 0.85 ? 'rgba(74, 222, 128, 0.8)' :
                        confidence > 0.70 ? 'rgba(34, 211, 238, 0.6)' :
                            confidence > 0.50 ? 'rgba(59, 130, 246, 0.5)' :
                                'rgba(129, 140, 248, 0.4)' // Default/Confused shadow
                        }`
                }}
                className={`w-48 h-48 md:w-80 md:h-80 rounded-full bg-black/50 border-2
                           ${confidence > 0.85 ? 'border-green-400' : 'border-cyan-500/30'}
                           backdrop-blur-xl flex items-center justify-center overflow-hidden
                           transition-colors duration-500
                           ${getHarmonyClass(confidence)}`}
            >
                {/* CORE CHARACTER FACE */}
                <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    animate={isThinking ? { y: [-6, 6, -6], scale: [1, 1.05, 1], filter: "brightness(1.1)" } : { y: [-4, 4, -4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img
                        src="/assets/mindora_face_v2.png"
                        alt="Mindora AI"
                        loading="lazy"
                        decoding="async"
                        className="w-[90%] h-[90%] object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                    />
                </motion.div>
            </motion.div>
        </div >
    );
}
