import { Entity, UserAnswer } from "../types";

/**
 * 4. VECTOR SEMANTIC ML ENGINE
 * Purpose: Detect similarity via Embeddings.
 * 
 * NOTE: This requires OpenAI API. For now, we simulate a score 
 * based on string feature overlap to prevent build errors if Key is missing.
 */
export class VectorEngine {

    static async computeSimilarity(candidates: Entity[], history: UserAnswer[]): Promise<Map<string, number>> {
        const scores = new Map<string, number>();

        candidates.forEach(entity => {
            // Feature Overlap Heuristic
            let overlap = 0;
            let total = 0;

            history.forEach(ans => {
                const val = entity.features[ans.featureKey];
                if (val) {
                    total++;
                    if (val === ans.answer) overlap++;
                    else if ((val === 'Probably' && ans.answer === 'Yes') || (val === 'Probably Not' && ans.answer === 'No')) overlap += 0.8;
                }
            });

            const score = total > 0 ? (overlap / total) : 0.5;
            scores.set(entity.id, score);
        });

        return scores;
    }
}
