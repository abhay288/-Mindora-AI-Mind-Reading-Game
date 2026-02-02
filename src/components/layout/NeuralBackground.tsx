"use client";

import { LottieWrapper } from "@/components/ui/LottieWrapper";
import { useEffect, useState } from "react";

// Placeholder for missing Lottie (Using Canvas or simply CSS to simulate)
import { BackgroundCanvas } from "@/components/layout/BackgroundCanvas"; // Fallback we will reuse for now

export function NeuralBackground() {
    const [hasLottie, setHasLottie] = useState(false);

    // Check if Lottie file exists in public/animations (handled via logic or passed prop)
    // For now, since user provided a specific requirement but no files, we default to the Canvas fallback 
    // BUT we structure it to easily swap in the Lottie.

    // Ideally: <LottieWrapper animationData={require('@/public/animations/neural-particles.json')} ... />

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
            {/* 1. Base Gradient - Adaptive to Theme */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--color-primary)_0%,transparent_50%)] opacity-10" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/90 to-background/40" />

            {/* 2. Floating Particles (Canvas Fallback until JSON is added) */}
            <BackgroundCanvas />

            {/* 3. Soft Light Bloom (Top Right) */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" />

            {/* 4. Soft Light Bloom (Bottom Left) */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        </div>
    );
}
