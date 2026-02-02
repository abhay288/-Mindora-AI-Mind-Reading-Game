import { NextResponse } from 'next/server';

import { PatternEngine } from "@/lib/engine/cores/patternEngine";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, entityId, confirmed } = body;

        // ... inside POST body
        console.log(`SESSION [${sessionId}]: User confirmed guess [${entityId}] is ${confirmed}`);

        if (confirmed) {
            // LEARNING HOOK: Save this pattern
            const { history } = body; // Make sure to pass history from client!
            if (history) {
                PatternEngine.learnPattern(history, entityId, 1.0, 'general');
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to confirm" }, { status: 500 });
    }
}
