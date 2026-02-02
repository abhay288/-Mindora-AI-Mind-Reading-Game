"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NeuralBackground } from "@/components/layout/NeuralBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { useGameStore } from "@/lib/store";
import { Cat, User, Box, ArrowLeft } from "lucide-react";

const themes = [
    { id: 'animals', label: 'Animals', icon: Cat, color: 'text-orange-500' },
    { id: 'characters', label: 'Characters', icon: User, color: 'text-indigo-500' },
    { id: 'objects', label: 'Objects', icon: Box, color: 'text-emerald-500' },
];

export default function ThemeSelectionPage() {
    const router = useRouter();
    const { setTheme } = useGameStore();

    const handleSelect = (themeId: string) => {
        setTheme(themeId);
        router.push("/game");
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
            <NeuralBackground />

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 p-3 rounded-full bg-white/50 hover:bg-white backdrop-blur-md transition-all group"
            >
                <ArrowLeft className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl md:text-5xl font-heading text-foreground mb-4">Choose a Category</h2>
                <p className="text-lg text-muted-foreground font-light">What logic should I synthesize?</p>
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {themes.map((theme, idx) => (
                    <motion.div
                        key={theme.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSelect(theme.id)}
                        className="cursor-pointer group"
                    >
                        <GlassCard hoverEffect={true} className="h-64 flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-primary/20 transition-all">
                            <div className={`p-6 rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${theme.color}`}>
                                <theme.icon className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-heading text-primary group-hover:text-secondary transition-colors">{theme.label}</h3>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
