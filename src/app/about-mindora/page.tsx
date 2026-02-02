
import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = {
    title: "About Mindora | The Artificial Neural Intelligence",
    description: "Learn about the architecture and philosophy behind Mindora, the AI guessing game.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-black/90 text-white">
            <GlassCard className="max-w-3xl w-full p-8 md:p-12 space-y-6">
                <h1 className="text-3xl md:text-5xl font-heading text-cyan-400">About Mindora</h1>
                <p className="text-lg leading-relaxed text-slate-300">
                    Mindora is not just a game; it is an experiment in **Artificial Neural Intuition**.
                    Unlike traditional "Akinator" clones that use static decision trees, Mindora utilizes
                    **high-dimensional vector embeddings** and **probabilistic entropy engines** to "feel"
                    the right answer.
                </p>
                <h2 className="text-2xl font-bold text-white mt-4">How It Thinks</h2>
                <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>**Semantic Vectors**: It understands concepts, not just keywords.</li>
                    <li>**Entropy & Chaos**: It intentionally takes risks to break stalemates.</li>
                    <li>**Adaptive Personality**: It learns from every session, evolving its pattern recognition.</li>
                </ul>
            </GlassCard>
        </main>
    );
}
