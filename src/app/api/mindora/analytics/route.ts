
import { NextResponse } from 'next/server';
import { ServerAnalytics, GameSessionLog } from '@/lib/engine/serverAnalytics';

export async function POST(req: Request) {
    try {
        const session: GameSessionLog = await req.json();
        ServerAnalytics.logSession(session);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to log session' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const metrics = ServerAnalytics.getMetrics();
        return NextResponse.json(metrics || {});
    } catch (e) {
        return NextResponse.json({ error: 'Failed to get metrics' }, { status: 500 });
    }
}
