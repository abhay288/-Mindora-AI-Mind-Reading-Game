
import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = {
    title: "Privacy Policy | Mindora",
    description: "Mindora respects your privacy. View our data handling practices.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-black/90 text-white">
            <GlassCard className="max-w-3xl w-full p-8 md:p-12 space-y-6">
                <h1 className="text-3xl md:text-4xl font-heading text-emerald-400">Privacy Policy</h1>
                <p className="text-sm text-slate-500">Last Updated: 2026-02-03</p>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">1. Data Collection</h2>
                    <p className="text-slate-300">
                        Mindora collects anonymous gameplay data (questions answered, entities guessed) to improve its
                        neural engine. We do not track personal identities or store sensitive user information.
                    </p>

                    <h2 className="text-xl font-bold text-white">2. Cookies</h2>
                    <p className="text-slate-300">
                        We use local storage to save your session theme and progress. No third-party tracking cookies are used.
                    </p>
                </section>
            </GlassCard>
        </main>
    );
}
