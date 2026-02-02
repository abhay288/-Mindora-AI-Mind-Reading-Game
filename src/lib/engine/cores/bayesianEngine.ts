import { Entity, UserAnswer } from "../types";

/**
 * 3. BAYESIAN PROBABILITY ENGINE
 * Purpose: Continuously update probability based on new evidence.
 * P(E|A) = P(A|E) * P(E) / P(A)
 */
export class BayesianEngine {

    static updateProbabilities(
        candidates: Entity[],
        currentPriors: Record<string, number>, // Previous turn's probabilities
        lastAnswer: UserAnswer
    ): Record<string, number> {
        const newPosteriors: Record<string, number> = {};
        let totalEvidence = 0;

        candidates.forEach(entity => {
            const prior = currentPriors[entity.id] || (entity.popularity || 0.5);
            const likelihood = this.calculateLikelihood(entity, lastAnswer);

            const posteriorNumerator = likelihood * prior;
            newPosteriors[entity.id] = posteriorNumerator;
            totalEvidence += posteriorNumerator;
        });

        // Normalize (Evidence)
        if (totalEvidence > 0) {
            candidates.forEach(entity => {
                newPosteriors[entity.id] = newPosteriors[entity.id] / totalEvidence;
            });
        }

        return newPosteriors;
    }

    private static calculateLikelihood(entity: Entity, answer: UserAnswer): number {
        const entityVal = entity.features[answer.featureKey];

        // Map textual values to numeric probabilities [0.0 - 1.0]
        const getWeight = (val: string | undefined): number => {
            if (val === 'Yes') return 1.0;
            if (val === 'Probably') return 0.75;
            if (val === 'Don\'t Know') return 0.5;
            if (val === 'Probably Not') return 0.25;
            if (val === 'No') return 0.0;
            return 0.5; // Default/Missing
        };

        const valP = getWeight(entityVal); // Entity's truth value
        const ansP = getWeight(answer.answer); // User's answer value

        // 3. ANSWER WEIGHT MAPPING & LIKELIHOOD
        // Logic: Likelihood is Similarity. 
        // If User says YES (1.0) and Entity is YES (1.0), Diff is 0, Similarity is 1.0.
        // If User says NO (0.0) and Entity is YES (1.0), Diff is 1.0, Similarity is 0.0.

        const diff = Math.abs(valP - ansP);
        return 1.0 - diff;
    }
}
