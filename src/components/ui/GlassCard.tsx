"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" } : undefined}
            transition={{ duration: 0.4 }}
            className={cn(
                "glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden",
                className
            )}
        >
            {/* Subtle Inner Highlight */}
            <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
