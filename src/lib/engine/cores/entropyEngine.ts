import { Entity, Question, UserAnswer, SessionState } from "../types";
import { MathUtils } from "../../utils/mathUtils";

/**
 * 6. QUESTION ENTROPY RANKING
 * Purpose: Select the most informative question.
 */
export class EntropyEngine {

    // Select best question from available pool
    static selectBestQuestion(
        questions: Question[],
        candidates: Entity[],
        askedQuestionIds: string[],
        askedFeatureKeys: string[] = [], // Passed from history
        lastAnswer?: { featureKey: string, answer: string },
        forbiddenIds: string[] = [] // NEW: Anti-Boredom Session Memory
    ): Question | null {

        // 0. DETECT RESOLVED FEATURES (Auto-Lock)
        // If 90% of candidates have the same value for a feature, don't ask it.
        const lockThreshold = 0.9;
        const totalCands = candidates.length;
        const resolvedKeys: string[] = [];

        if (totalCands > 2) { // Only lock if we have a decent pool
            // We need to check available features. 
            // Optimization: Only check features OF the available questions to save loops?
            // Actually, we can check this inside the exclusion filter or pre-calc.
            // Let's pre-calc for the features in questions list (naive iteration ok for small mocks).

            // Collect all potential feature keys from valid questions
            const potentialKeys = new Set(questions.map(q => q.featureKey));

            potentialKeys.forEach(key => {
                const counts: Record<string, number> = {};
                candidates.forEach(c => {
                    const val = c.features[key] || 'Dont Know';
                    counts[val] = (counts[val] || 0) + (c.score || 1); // Weighted
                });

                // Check dominance
                const totalWeight = Object.values(counts).reduce((a, b) => a + b, 0);
                for (const val in counts) {
                    if (counts[val] / totalWeight >= lockThreshold) {
                        resolvedKeys.push(key);
                        break;
                    }
                }
            });
        }

        // 1. FILTER: Exclude Asked + Resolved
        const available = questions.filter(q =>
            !askedQuestionIds.includes(q.id) &&
            !askedFeatureKeys.includes(q.featureKey) &&
            !resolvedKeys.includes(q.featureKey)
        );

        if (available.length === 0) return null;

        let bestQ = available[0];
        let maxScore = -1;

        // 2. Identify Context Tags from Last Answer (for Diversity/Follow-up)
        const contextTags = new Set<string>();
        let lastTags: string[] = []; // For Diversity Guard

        if (lastAnswer) {
            const lastQ = questions.find(q => q.featureKey === lastAnswer.featureKey);
            if (lastQ) {
                if (lastAnswer.answer === 'Yes' && lastQ.positive_next_tags) {
                    lastQ.positive_next_tags.forEach(t => contextTags.add(t));
                }
                if (lastAnswer.answer === 'No' && lastQ.negative_next_tags) {
                    lastQ.negative_next_tags.forEach(t => contextTags.add(t));
                }
                if (lastQ.tags) lastTags = lastQ.tags;
            }
        }

        // 3. Score each question
        const scoredQuestions = available.map(q => {
            // Count Yes/No split for this feature
            let yesCount = 0;
            let noCount = 0;
            let popularityBias = 0;

            candidates.forEach(c => {
                const val = c.features[q.featureKey];
                const weight = (c.score || 0) + (c.popularity || 0.5) * 0.5;

                if (val === 'Yes' || val === 'Probably') {
                    yesCount += weight;
                } else if (val === 'No' || val === 'Probably Not') {
                    noCount += weight;
                } else {
                    yesCount += weight * 0.5;
                    noCount += weight * 0.5;
                }
            });

            // Normalize
            const totalWeight = yesCount + noCount;
            if (totalWeight === 0) return { ...q, entropy_score: 0, split_ratio: 0.5 };

            const p = yesCount / totalWeight;

            // Base Entropy
            let entropy = 0;
            if (p > 0 && p < 1) {
                entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
            }

            // MINIMUM ENTROPY GUARD
            // If entropy is extremely low (< 0.1), it provides almost no info.
            // Heavily penalize or effectively zero it.
            if (entropy < 0.15) entropy = 0;

            // Calculate Popularity Bias
            let popYes = 0;
            let popTotal = 0;
            candidates.forEach(c => {
                if ((c.popularity || 0) > 0.7) {
                    const val = c.features[q.featureKey];
                    const w = c.score || 1;
                    popTotal += w;
                    if (val === 'Yes' || val === 'Probably') popYes += w;
                    else if (val === 'Dont Know') popYes += w * 0.5;
                }
            });

            if (popTotal > 0) {
                const popP = popYes / popTotal;
                const popSplitScore = 1 - 2 * Math.abs(0.5 - popP);
                popularityBias = popSplitScore * 0.2;
            }

            // 4. Calculate Relevance (Context Boost) & Tag Diversity
            let relevance = 1.0;

            // Diversity check: If tags overlap with last question, apply penalty (unless in 'drill-down' mode?)
            // We generally want to hop topics early on.
            if (q.tags && lastTags.length > 0) {
                const tagOverlap = q.tags.filter(t => lastTags.includes(t)).length;
                if (tagOverlap > 0) {
                    // If we are early game, penalize repetition.
                    if (askedQuestionIds.length < 5) relevance *= 0.7;
                    // Later game, drill-down is fine.
                }
            }

            if (q.tags?.some(tag => contextTags.has(tag))) {
                relevance = 1.3; // Boost intended follow-ups
            }

            const quality = q.quality_score || 0.8;
            const usagePenalty = (q.usage_count || 0) * 0.15;

            // NOVELTY / RANDOM NOISE (Anti-Order)
            // If Turn 0 (empty history) -> High Noise to shuffle openers
            // If Question is in forbiddenIds -> Massive Penalty (Cooldown)

            let noise = Math.random() * 0.05;
            if (askedQuestionIds.length === 0) {
                noise = Math.random() * 0.4; // 40% Random swing for openers
            }

            let cooldownPenalty = 0;
            if (forbiddenIds.includes(q.id)) {
                cooldownPenalty = 10.0; // Effectively bans it unless it's the ONLY option
            }

            // Final Score
            const finalScore = (entropy * quality * relevance) + popularityBias - usagePenalty - cooldownPenalty + noise;

            if (finalScore > maxScore) {
                maxScore = finalScore;
                bestQ = q;
            }

            return {
                ...q,
                entropy_score: entropy,
                split_ratio: p
            };
        });

        // 4. Sort and return
        // Filter out zero entropy questions unless we are desperate
        const viable = scoredQuestions.filter(q => (q.entropy_score || 0) > 0.05);

        if (viable.length > 0) {
            viable.sort((a, b) => (b.entropy_score || 0) - (a.entropy_score || 0));
            return viable[0];
        }

        // If no viable high-entropy questions, return highest of the low-entropy ones (better than nothing)
        scoredQuestions.sort((a, b) => (b.entropy_score || 0) - (a.entropy_score || 0));
        return scoredQuestions[0] || null;
    }
}
