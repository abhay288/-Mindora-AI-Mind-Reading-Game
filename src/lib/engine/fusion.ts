import { Entity } from "./types";

/**
 * 5. CONFIDENCE FUSION ENGINE
 * Purpose: Combine Rule, Fuzzy, Bayesian, and ML scores into a final decision.
 */
export class FusionEngine {

    static calculateFinalBroadcasting(
        ruleScores: Map<string, number>,
        mlScores: Map<string, number>,
        fuzzyScores: Map<string, number>,
        intentScores: Map<string, number>,
        patternScores: Map<string, number>,
        copilotScores: Map<string, number> = new Map() // Default empty for safety
    ): Map<string, number> {
        const finalScores = new Map<string, number>();

        // Get all unique IDs
        const allIds = new Set([
            ...ruleScores.keys(),
            ...mlScores.keys(),
            ...fuzzyScores.keys(),
            ...intentScores.keys(),
            ...patternScores.keys(),
            ...copilotScores.keys()
        ]);

        for (const id of allIds) {
            // A. Base Weights (Sum = 1.0)
            const r = ruleScores.get(id) || 0;
            const m = mlScores.get(id) || 0;
            const f = fuzzyScores.get(id) || 0;
            const i = intentScores.get(id) || 0;
            const p = patternScores.get(id) || 0;
            const c = copilotScores.get(id) || 0;

            // Updated Formula for Copilot Integration (Phase 8)
            // (0.35 Rule) + (0.25 ML) + (0.20 Fuzzy) + (0.10 Pattern) + (0.10 Copilot)
            let baseScore = (r * 0.35) + (m * 0.25) + (f * 0.20) + (p * 0.10) + (c * 0.10);

            // B. Bonuses & Boosts
            // Pattern Bonus: If exact match found
            if (p > 0.95) baseScore += 0.15; // Mind Reading Effect

            // Learning Reinforcement Bonus (Dynamic)
            // If user taught this recently, it has a boost value (e.g., +2.0)
            // We normalize it slightly but ensure it dominates if relevant
            const entity = ruleScores instanceof Map ? undefined : undefined; // TODO: Need access to entity for boost.
            // Since we don't have entity object here, we assume the scores map helps.
            // Actually, we need to pass Entity[] or look it up.
            // For now, we will trust the caller to pre-boost or we assume boost is folded into one of the scores?
            // BETTER: Let's assume the callers (ML/Rule) don't have it. We should pass candidates map?
            // Refactor: We can't access learning_boost here easily without candidates list.

            // To fix this without breaking signature too much, let's just return Weighted Score.
            // The caller (route.ts) has the candidates list and can apply the `learning_boost` addition.

            finalScores.set(id, baseScore);
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
