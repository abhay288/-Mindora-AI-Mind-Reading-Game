"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface PulseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "option";
    pulse?: boolean;
}

export function PulseButton({ children, className, variant = "primary", pulse = false, onClick, ...props }: PulseButtonProps) {
    const [isClicking, setIsClicking] = useState(false);

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(15,118,110,0.5)] border-transparent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] border-transparent",
        ghost: "bg-transparent hover:bg-black/5 text-primary border-transparent",
        option: "bg-white/60 backdrop-blur-md border-white/60 hover:bg-white text-foreground hover:scale-[1.02] shadow-sm hover:shadow-md hover:border-primary/30",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsClicking(true);
        // Reset click state for animation replay
        setTimeout(() => setIsClicking(false), 400);
        if (onClick) onClick(e);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
                "relative flex items-center justify-center px-8 py-4 text-lg font-medium tracking-wide transition-all duration-300 rounded-full border overflow-hidden group",
                variants[variant],
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {/* Ripple Effect Container */}
            {isClicking && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="absolute w-full h-full bg-white/30 rounded-full animate-ripple" />
                </span>
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Pulse Glow for Primary */}
            {pulse && variant === 'primary' && (
                <span className="absolute inset-0 rounded-full animate-pulse-slow bg-primary/20 blur-xl pointer-events-none" />
            )}
        </motion.button>
    );
}
