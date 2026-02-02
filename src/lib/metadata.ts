import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Mindora - The AI Mind Reader | Play Now",
    description: "Challenge Mindora, the advanced AI that can read your mind. Think of any character, and I will guess it in 20 questions.",
    openGraph: {
        title: "Mindora - The AI Mind Reader",
        description: "Can you beat the AI? Think of a character and let Mindora guess it.",
        url: "https://mindora.ai",
        siteName: "Mindora",
        images: [
            {
                url: "/assets/mindora_face_v2.png", // Ideally a social card image
                width: 1200,
                height: 630,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mindora - The AI Mind Reader",
        description: "Challenge the AI. Think of a character.",
        images: ["/assets/mindora_face_v2.png"],
    },
    metadataBase: new URL('https://mindora.ai'),
};
