"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PulseButton } from "@/components/ui/PulseButton";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RefreshCw, Link as LinkIcon, MessageCircle } from "lucide-react";
import { useState } from "react";

export function VictoryView() {
    const { language, guessResult, resetGame, turnCount } = useGameStore();
    const [showFallback, setShowFallback] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://mindora.ai';
    const shareText = language === 'en'
        ? `I challenged Mindora and it guessed ${guessResult?.name} in ${turnCount} turns! Can you beat my score? 🧠✨ #MindoraAI`
        : `मैंने मिंडोरा को चुनौती दी और उसने ${turnCount} बारी में ${guessResult?.name} का अनुमान लगा लिया! क्या आप मेरा स्कोर तोड़ सकते हैं? 🧠✨ #MindoraAI`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mindora AI Challenge',
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                console.warn("Share cancelled or failed", err);
            }
        } else {
            setShowFallback(!showFallback);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openSocial = (platform: 'wa' | 'x' | 'fb') => {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(shareUrl);
        let link = '';

        switch (platform) {
            case 'wa': link = `https://wa.me/?text=${text}%20${url}`; break;
            case 'x': link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
            case 'fb': link = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        }
        window.open(link, '_blank');
    };

    return (
        <GlassCard className="w-full text-center p-12 space-y-8 border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
            {/* Confetti or simple win graphic could go here */}

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
            >
                <div className="text-emerald-500 text-2xl font-bold uppercase tracking-widest">
                    {language === 'en' ? "I Knew It!" : "मुझे पता था!"}
                </div>

                <h2 className="text-4xl md:text-5xl font-heading bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-500">
                    {guessResult?.name}
                </h2>

                <p className="text-white/60">
                    {language === 'en' ? `Guessed in ${turnCount} questions.` : `${turnCount} प्रश्नों में अनुमान लगाया।`}
                </p>

                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex gap-4">
                        <PulseButton onClick={handleShare} variant="secondary" className="gap-2 px-6">
                            <Share2 className="w-4 h-4" /> {language === 'en' ? "Share" : "शेयर करें"}
                        </PulseButton>
                        <PulseButton onClick={resetGame} variant="primary" className="gap-2 px-6">
                            <RefreshCw className="w-4 h-4" /> {language === 'en' ? "Play Again" : "फिर से"}
                        </PulseButton>
                    </div>

                    {/* Fallback Buttons (Desktop or when native share fails) */}
                    <AnimatePresence>
                        {showFallback && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex gap-3 mt-4 overflow-hidden"
                            >
                                <button onClick={() => openSocial('wa')} className="p-3 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] transition-colors" title="WhatsApp">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                                <button onClick={() => openSocial('x')} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors font-bold w-11 h-11 flex items-center justify-center" title="X (Twitter)">
                                    𝕏
                                </button>
                                <button onClick={() => openSocial('fb')} className="p-3 rounded-full bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-[#1877F2] transition-colors font-bold w-11 h-11 flex items-center justify-center" title="Facebook">
                                    f
                                </button>
                                <button onClick={handleCopy} className="p-3 rounded-full bg-primary/20 hover:bg-primary/40 text-primary transition-colors relative" title="Copy Link">
                                    <LinkIcon className="w-5 h-5" />
                                    {copied && (
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            Copied!
                                        </span>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </GlassCard>
    );
}
