import { Entity, UserAnswer, FeatureValue } from "../types";

/**
 * 1. RULE-BASED EXPERT SYSTEM
 * Purpose: Eliminate impossible candidates instantly.
 */
export class RuleEngine {

    // Hard Logic: If user says "Yes" to "Can Fly", remove all "No"s.
    // If user says "No", remove all "Yes"s.
    // "Probably" / "Don't Know" are skipped by this hard engine (handled by Fuzzy).
    static filterCandidates(candidates: Entity[], lastAnswer: UserAnswer): Entity[] {
        const { featureKey, answer } = lastAnswer;

        // Only filter on hard constraints
        if (answer === 'Dont Know' || answer === 'Probably' || answer === 'Probably Not') {
            return candidates;
        }

        return candidates.filter(entity => {
            const entityValue = entity.features[featureKey];

            // If entity data is missing, keep it (innocent until proven guilty)
            if (!entityValue) return true;

            // STRICT MATCHING
            if (answer === 'Yes' && entityValue === 'No') return false; // User: Fly? Yes. Entity: Fly? No. -> KILL
            if (answer === 'No' && entityValue === 'Yes') return false; // User: Fly? No. Entity: Fly? Yes. -> KILL

            return true;
        });
    }

    static calculateRuleScore(candidates: Entity[]): Record<string, number> {
        // Simple presence score (1.0 if strictly valid, 0.0 if not)
        // Since we filtered mostly, this is less useful unless we do soft-rules later.
        const scores: Record<string, number> = {};
        candidates.forEach(c => scores[c.id] = 1.0);
        return scores;
    }
}
