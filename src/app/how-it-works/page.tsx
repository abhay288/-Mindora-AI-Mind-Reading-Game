
import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = {
    title: "How Mindora Works | The Tech Behind the Magic",
    description: "Discover the neural architecture powering Mindora's mind-reading abilities.",
};

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-black/90 text-white">
            <GlassCard className="max-w-3xl w-full p-8 md:p-12 space-y-6">
                <h1 className="text-3xl md:text-4xl font-heading text-purple-400">The Neural Architecture</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-xl font-bold text-cyan-300 mb-2">1. Vector Embeddings</h3>
                        <p className="text-sm text-slate-400">
                            Every character and question isn't just ID; it's a point in a 1536-dimensional space.
                            Mindora calculates distance between concepts to find hidden connections.
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-xl font-bold text-amber-300 mb-2">2. Entropy Engine</h3>
                        <p className="text-sm text-slate-400">
                            To avoid robotic repetition, Mindora calculates the "Information Gain" of every possible question
                            to maximize its speed in narrowing down the answer.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </main>
    );
}
