
import { Persistence } from "../../lib/engine/persistence";

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

export class ServerAnalytics {
    static logSession(session: GameSessionLog) {
        const logs = Persistence.loadFile<GameSessionLog[]>('analytics.json', []);
        logs.push(session);
        if (logs.length > 1000) logs.shift();
        Persistence.saveFile('analytics.json', logs);
    }

    static getMetrics() {
        const logs = Persistence.loadFile<GameSessionLog[]>('analytics.json', []);
        if (logs.length === 0) return null;

        const distinctGames = logs.length;
        const avgTurns = logs.reduce((sum, l) => sum + l.turns, 0) / distinctGames;
        const successRate = logs.filter(l => l.success).length / distinctGames;

        return {
            total_games: distinctGames,
            avg_turns: avgTurns.toFixed(2),
            success_rate: (successRate * 100).toFixed(1) + '%',
            last_played: logs[logs.length - 1].timestamp
        };
    }
}
