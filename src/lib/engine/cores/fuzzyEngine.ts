import { Entity, UserAnswer, FeatureValue } from "../types";

/**
 * 2. FUZZY LOGIC ENGINE
 * Purpose: Handle uncertain answers with weighted membership.
 */
export class FuzzyEngine {

    private static getMembershipWeight(userAns: FeatureValue, entityVal: FeatureValue): number {
        // Perfect Match
        if (userAns === entityVal) return 1.0;

        // Hard Mismatch
        if ((userAns === 'Yes' && entityVal === 'No') || (userAns === 'No' && entityVal === 'Yes')) return 0.0;

        // Fuzzy Table
        if (userAns === 'Probably' && entityVal === 'Yes') return 0.75;
        if (userAns === 'Probably' && entityVal === 'No') return 0.25;

        if (userAns === 'Probably Not' && entityVal === 'No') return 0.75;
        if (userAns === 'Probably Not' && entityVal === 'Yes') return 0.25;

        if (userAns === 'Dont Know') return 0.5; // Neutral

        return 0.5; // Default neutral for edge cases
    }

    static computeScores(candidates: Entity[], history: UserAnswer[]): Map<string, number> {
        const scores = new Map<string, number>();

        candidates.forEach(entity => {
            let totalWeight = 0;
            let matchScore = 0;

            history.forEach(ans => {
                const entityVal = entity.features[ans.featureKey];
                if (!entityVal) return; // Skip if entity has no data for this

                const weight = 1.0; // Can be dynamic significance later
                const membership = this.getMembershipWeight(ans.answer, entityVal);

                matchScore += membership * weight;
                totalWeight += weight;
            });

            // Normalize
            scores.set(entity.id, totalWeight === 0 ? 0.5 : (matchScore / totalWeight));
        });

        return scores;
    }
}
