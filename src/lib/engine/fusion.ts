import { Entity } from "./types";

/**
 * 5. CONFIDENCE FUSION ENGINE
 * Purpose: Combine Rule, Fuzzy, Bayesian, and ML scores into a final decision.
 */
export class FusionEngine {

    static calculateFinalBroadcasting(
        candidates: Entity[],
        ruleScores: Map<string, number>,
        mlScores: Map<string, number>,
        fuzzyScores: Map<string, number>,
        intentScores: Map<string, number>,
        patternScores: Map<string, number>,
        copilotScores: Map<string, number> = new Map()
    ): Map<string, number> {
        const finalScores = new Map<string, number>();

        for (const candidate of candidates) {
            const id = candidate.id;
            const r = ruleScores.get(id) || 0;
            const m = mlScores.get(id) || 0;
            const f = fuzzyScores.get(id) || 0;
            const p = patternScores.get(id) || 0;
            const c = copilotScores.get(id) || 0;

            // Base Weighted Formula
            let baseScore = (r * 0.35) + (m * 0.25) + (f * 0.20) + (p * 0.10) + (c * 0.10);

            // B. Bonuses & Boosts
            // Pattern Bonus: If exact match found
            if (p > 0.95) baseScore += 0.15;

            // Learning Reinforcement Bonus (Dynamic)
            if (candidate.learning_boost) {
                baseScore += candidate.learning_boost;
            }

            finalScores.set(id, Math.min(0.99, baseScore));
        }

        return finalScores;
    }

    static decide(candidates: Entity[], scores: Map<string, number>, turnCount: number, behaviorPattern: string) {
        // Sort by score
        const sorted = candidates.sort((a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0));
        const topCandidate = sorted[0];
        const topScore = scores.get(topCandidate?.id) || 0;

        // Adaptive Thresholds based on Behavior and Turn Count
        let HARD_THRESHOLD = 0.85;
        let SOFT_THRESHOLD = 0.70;

        // If user is decisive, we can guess earlier (lower threshold)
        if (behaviorPattern === 'Decisive') {
            HARD_THRESHOLD = 0.80;
            SOFT_THRESHOLD = 0.65;
        }

        if (!topCandidate) return { action: 'error' };

        // Early Guess Strategy (Mind Reading Illusion)
        // If high confidence in first 5 turns, make a "Soft" guess immediately
        if (turnCount <= 5 && topScore > 0.75) {
            return { action: 'guess', candidate: topCandidate, type: 'soft', reason: 'early_read' };
        }

        if (topScore > HARD_THRESHOLD && turnCount > 5) {
            return { action: 'guess', candidate: topCandidate, type: 'hard' };
        }

        if (topScore > SOFT_THRESHOLD && turnCount > 8) {
            return { action: 'guess', candidate: topCandidate, type: 'soft' };
        }

        return { action: 'ask', filteredCount: sorted.length };
    }
}
