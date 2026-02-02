import { SHOW_LEARNING_BADGE } from "@/lib/flags";

export function LearningBadge() {
    if (!SHOW_LEARNING_BADGE) return null;

    return (
        <div className="fixed top-4 right-4 z-60 select-none md:top-6 md:right-6">
            <div className="group relative">
                <span className="
                    relative z-10 block
                    bg-linear-to-r from-purple-500 to-cyan-500
                    text-white text-xs md:text-sm font-medium
                    px-3 py-1 rounded-full shadow-lg
                    backdrop-blur-sm
                    animate-pulse
                    cursor-help
                ">
                    🧠 Mindora is in Learning Phase
                </span>

                {/* Tooltip - Desktop Only */}
                <div className="
                    absolute right-0 top-full mt-2
                    hidden group-hover:block
                    w-max max-w-[200px]
                    px-3 py-2
                    bg-black/90 border border-white/10 rounded-lg
                    text-[10px] text-white/90
                    shadow-xl
                    z-20
                ">
                    Mindora improves with every game you play.
                </div>
            </div>
        </div>
    );
}
