import { Entity, UserAnswer, BehavioralProfile } from "../types";

/**
 * 8. PREDICTIVE INTENT ENGINE
 * Purpose: Jump ahead before obvious answers using popularity and behavior.
 * Formula: IntentScore = PopularityWeight + Similarity + BehaviorWeight
 */
export class PredictiveEngine {

    static predict(
        candidates: Entity[],
        behavior: BehavioralProfile,
        mlScores: Map<string, number>
    ): Map<string, number> {

        const intentScores = new Map<string, number>();

        // Weight Factors based on Behavior
        let popularityWeight = 0.5;

        if (behavior.pattern === 'Decisive') popularityWeight = 0.7; // Fast users likely think of popular things
        if (behavior.pattern === 'Uncertain') popularityWeight = 0.3; // Uncertain users might have obscure obscure characters

        candidates.forEach(entity => {
            const P = entity.popularity || 0.5;
            const M = mlScores.get(entity.id) || 0.5;

            // Simple Predictive Formula
            // We boost popular items for decisive users
            // We boost semantic closeness

            intentScores.set(entity.id, (P * popularityWeight) + (M * (1 - popularityWeight)));
        });

        return intentScores;
    }
}
