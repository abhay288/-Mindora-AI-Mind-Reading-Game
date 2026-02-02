// Client-Side Analytics Utils (No FS imports)

export interface GameSessionLog {
    id: string;
    timestamp: number;
    theme: string;
    region: string;
    final_confidence: number;
    turns: number;
    success: boolean;
    avg_decision_time: number;
}

export class AnalyticsUtils {

    static async logSession(session: GameSessionLog) {
        try {
            await fetch('/api/mindora/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(session)
            });
        } catch (e) {
            console.error("Analytics Log Failed", e);
        }
    }

    static async getMetrics() {
        try {
            const res = await fetch('/api/mindora/analytics');
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }
}
