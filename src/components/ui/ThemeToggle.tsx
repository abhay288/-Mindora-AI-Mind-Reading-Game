"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { PulseButton } from "./PulseButton";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <PulseButton
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-full bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center w-12 h-12"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-teal-400 absolute" />
            <span className="sr-only">Toggle theme</span>
        </PulseButton>
    );
}
