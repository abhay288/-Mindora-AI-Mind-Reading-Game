"use client";

import { useLottie } from "lottie-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LottieWrapperProps {
    animationData: any; // JSON object or import
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
}

export function LottieWrapper({
    animationData,
    className,
    loop = true,
    autoplay = true,
    speed = 1
}: LottieWrapperProps) {
    const options = {
        animationData,
        loop,
        autoplay,
    };

    const { View, setSpeed } = useLottie(options);

    useEffect(() => {
        setSpeed(speed);
    }, [speed, setSpeed]);

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {View}
        </div>
    );
}
