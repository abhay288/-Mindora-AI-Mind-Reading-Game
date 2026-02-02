import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: "Mindora - The AI Mind Reader | Play Free Online",
    description: "Play Mindora, the intelligent AI guessing game that reads your thoughts. An Akinator-style experience with adaptive learning and neural intelligence.",
    keywords: ["mind reading game", "AI guessing game", "akinator alternative", "intelligent quiz", "neural network game", "mindora"],
    authors: [{ name: "Mindora AI Team" }],
    openGraph: {
        title: "Mindora - The AI Mind Reader",
        description: "Can this AI guess what you're thinking? Play the neural mind-reading game now.",
        url: "https://mindora.ai",
        siteName: "Mindora",
        images: [
            {
                url: "https://mindora.ai/og-image.jpg", // Placeholder
                width: 1200,
                height: 630,
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mindora - AI Mind Reader",
        description: "Can this AI guess what you're thinking? Play now.",
        images: ["https://mindora.ai/og-image.jpg"],
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no", // Mobile optimization
    robots: {
        index: true,
        follow: true,
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication", // Or VideoGame
    "name": "Mindora",
    "applicationCategory": "Game",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": "An intelligent AI guessing game that reads your thoughts with smart questions and adaptive learning."
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 transition-colors duration-300`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
