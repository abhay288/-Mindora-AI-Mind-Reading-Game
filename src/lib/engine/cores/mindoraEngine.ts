import { Entity, Question, UserAnswer, SessionState, FeatureValue, BehavioralProfile } from "../types";
import { Persistence } from "../persistence";
import { BayesianEngine } from "./bayesianEngine";
import { PatternEngine } from "./patternEngine";
import { FuzzyEngine } from "./fuzzyEngine";
import { ConfigManager } from "../configManager";
import { RuleEngine } from "./ruleEngine";
import { EntropyEngine } from "./entropyEngine";
import { CopilotEngine } from "./copilotEngine";
import { OptimizationEngine } from "./optimizationEngine";

/**
 * CORE MINDORA INFERENCE ENGINE
 * Orchestrates all sub-engines to produce a final guess.
 */
export class MindoraEngine {

    // 1. INITIALIZE SESSION
    static initializeSession(
        candidates: Entity[],
        context?: { region: string, sessionMemory?: { theme: string, playCount: number } }
    ): SessionState {
        const totalPop = candidates.reduce((sum, c) => sum + Math.max(0.1, c.popularity || 0.5), 0);

        // Normalize Priors with ADAPTIVE BOOSTS
        candidates.forEach(c => {
            let boost = 0;

            // Feature 4: Regional Bias
            // Simple map: IN -> Bollywood/Cricketers
            if (context?.region === 'IN') {
                if (c.category_id === 'cat_bollywood' || c.category_id === 'cat_cricket') {
                    boost += 0.10;
                }
            }

            // Feature 1: Session Learning Boost
            // If theme matches category (loose check) or just generic streak
            if (context?.sessionMemory && context.sessionMemory.playCount > 1) {
                // If the user is playing the same theme repeatedly, boost "learning" (confidence)
                // Here we simply boost everyone slightly to speed up game,
                // OR we could boost entities that were "close" last time (if we tracked that).
                // Implementation: Boost popularity weight slightly for everyone to speed up questions
                // Or specific category boost if theme matches.
                // Simplified: Global "Warm" boost
                boost += 0.05 * Math.min(context.sessionMemory.playCount, 3); // Max 0.15
            }

            // Avoid zero prior
            const rawPrior = Math.max(0.1, (c.popularity || 0.5) + boost);
            c.score = rawPrior / totalPop;
        });

        // Initial Scores Object
        const scores: Record<string, any> = {};
        candidates.forEach(c => {
            scores[c.id] = c.score;
        });

        return {
            candidates,
            history: [],
            context, // Save context for later use
            scores,
            turnCount: 0,
            confidence: 0,
            behavior: {
                avgTimeTaken: 0,
                hesitationCount: 0,
                uncertaintyCount: 0,
                pattern: 'Logical'
            },
            status: 'playing'
        };
    }

    /**
     * MAIN LOOP: Evaluate Turn and Update State
     */
    static async evaluateTurn(
        state: SessionState,
        lastAnswer: UserAnswer,
        allQuestions: Question[]
    ): Promise<{
        state: SessionState,
        nextQuestion: Question | null,
        guess: Entity | null
    }> {
        const startTime = performance.now();
        // 2. Optimization Layer (Config Tuning)
        // Get Health Overrides
        const healthOverrides = OptimizationEngine.checkSystemHealth({
            avg_turns: state.turnCount, // simplistic proxy
            success_rate: 0.8 // default, assuming okay
        });

        // Get Plateau Overrides (if confidence log available in state/store - passed via context or assume we have it)
        // We need confidence history. It's in SessionState? No, currently in Store.
        // We added `confidence` to `SessionState`, but not a log.
        // We should rely on an external config update or pass it in.

        // ... (skipping for now to avoid complexity, assuming Health check covers "stuck" via turns)

        let config = ConfigManager.getEffectiveConfig({ ...healthOverrides });

        // Update History
        state.history.push(lastAnswer);
        state.turnCount++;

        // 5. ELIMINATION RULE (Hard Filtering)
        let activeCandidates: Entity[] = RuleEngine.filterCandidates(state.candidates, lastAnswer);

        // 4. PROBABILITY UPDATE (Bayesian)
        // Get current priors from previous state or entity scores
        const currentPriors: Record<string, number> = {};
        activeCandidates.forEach(c => currentPriors[c.id] = c.score || 0.01);

        const newBayesianScores = BayesianEngine.updateProbabilities(activeCandidates, currentPriors, lastAnswer);

        // 2 & 6. OTHER SCORES
        const fuzzyScores = FuzzyEngine.computeScores(activeCandidates, state.history);

        // Pattern Matching (Only after 3 turns)
        let patternScores = new Map<string, number>();
        if (state.turnCount >= 3) {
            patternScores = PatternEngine.findPatternMatches(state.history);
        }

        // 7. CONFIDENCE FUSION
        let bestCandidate: Entity | null = null;
        let maxConfidence = 0;

        activeCandidates.forEach((entity: Entity) => {
            const ruleS = 1.0; // Survived filter
            const bayesS = newBayesianScores[entity.id] || 0;
            const fuzzyS = fuzzyScores.get(entity.id) || 0.5;
            const patternS = patternScores.get(entity.id) || 0;
            const llmS = 0; // Placeholder until Copilot used

            // Weighted Sum
            // (0.35 Rule) + (0.25 ML/Bayes) + (0.20 Fuzzy) + (0.10 Pattern) + (0.10 LLM)
            // Note: Normalized Bayes is often small, so we might need to scale it or rely on relative rank.
            // For this formula to work as "Confidence", Bayes needs to be high for the leader.
            // The user formula seems to treat these as accumulating evidence components.

            // Adjusting weights slightly to ensure Bayes (Main Driver) has impact
            // If Bayes is normalized to sum to 1, a leader might have 0.3 while others have 0.01.
            // We'll use the raw Normalized Bayes score. 

            // Weighted Sum with POPULARITY BIAS
            // (0.35 Rule) + (0.25 Bayes) + (0.20 Fuzzy) + (0.10 Pattern) + (0.15 Base Popularity)

            const popularityBooster = (entity.popularity || 0.5) * 0.15; // User formula: + (popularity * 0.15)

            // Adaptive Confidence Factors
            let adaptiveBoost = 0;
            if (state.context) {
                // Session Boost (10%)
                if (state.context.sessionMemory && state.context.sessionMemory.playCount > 1) {
                    adaptiveBoost += 0.10 * Math.min(state.context.sessionMemory.playCount * 0.5, 1);
                }
                // Region Bias (10%)
                if (state.context.region === 'IN') { // Simplified check, normally check entity vs region map
                    if (entity.category_id === 'cat_bollywood' || entity.category_id === 'cat_cricket') adaptiveBoost += 0.10;
                }
            }

            // PLATEAU BREAKER LOGIC
            let plateauBoost = 0;
            // Check if confidence has stalled in last 3 turns
            // Using store.confidenceLog if available, or just check current vs max?
            // Since we are inside the loop, we calculate per entity. 
            // BUT Plateau is a GLOBAL state. We should set a flag before this loop.
            // Let's rely on passed 'overrides' from OptimizationEngine or calculate here.

            // Actually, we can check this OUTSIDE the entity loop in `calculateNextStep` or `OptimizationEngine`.
            // Let's implement it inside the score calculation for now as an "Exploration Boost" 
            // if we detect we are stuck.

            // ... (resuming standard logic)

            // Emotion Stability (Mock 5%) - e.g. consistent high confidence
            const emotionStability = 0.05 * ((entity.score || 0) > 0.7 ? 1 : 0);

            // Total Score Fusion
            // Total Score Fusion
            let finalScore =
                (config.rule_weight * ruleS) +
                (config.bayesian_weight * bayesS * 2) + // Keeping the *2 multiplier for now if intended or remove? Original had it.
                // Original: 0.20 * bayesS * 2 = 0.40. My config default 0.25. 
                // Let's assume config.bayesian_weight SHOULD be the effective weight. 
                // So I will remove * 2 and stick to config.
                // Wait, if I change logic I might break balance.
                // Let's keep * 2 if config is 0.20? No, that's confusing tuning.
                // I will remove * 2 and rely on Config. 
                // If I set default to 0.40, that matches old behavior (0.2 * 2).
                // Let's update default config to 0.40 in next step if generic, 
                // or just leave it at 0.25 * 2 = 0.50 (slightly aggressive).
                // Let's do (config.bayesian_weight * bayesS * 2) for safety/compatibility with my plan. 
                // Actually no, cleaner to have 1:1.
                // I will use: (config.bayesian_weight * bayesS * 2) to preserve "boost" logic if that's what it was. 
                // Re-reading: "0.20 * bayesS * 2". 
                // Let's do:
                (config.bayesian_weight * bayesS * 2) +
                (config.fuzzy_weight * fuzzyS) +
                (config.pattern_weight * patternS) +
                adaptiveBoost +
                emotionStability +
                popularityBooster;

            // Cap at 0.99
            finalScore = Math.min(0.99, finalScore);
            entity.score = finalScore;
            state.scores[entity.id] = {
                rule: ruleS,
                fuzzy: fuzzyS,
                bayesian: bayesS,
                ml: 0,
                intent: 0,
                final: finalScore
            };

            if (finalScore > maxConfidence) {
                maxConfidence = finalScore;
                bestCandidate = entity;
            }
        });

        // Update Candidates List (Remove Low Scores)
        // 5. ELIMINATION RULE: If score < threshold
        const THRESHOLD = 0.15;
        state.candidates = activeCandidates
            .filter(c => (c.score || 0) > THRESHOLD)
            .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by Predictive Score (Desc)

        // 8. GUESS STRATEGY - Strict Thresholds
        if (bestCandidate && state.candidates.length > 0) {

            // HARD GUESS (> 0.85)
            if (maxConfidence > 0.85) {
                state.status = 'guessing';
                return { state, nextQuestion: null, guess: bestCandidate };
            }

            // SOFT GUESS (0.70 - 0.85) - Only if Pattern Match is strong OR Popularity is very high
            const target: Entity = bestCandidate;
            const bestPatternScore = patternScores.get(target.id) || 0;
            const isVeryPopular = (target.popularity || 0) > 0.9;

            if (maxConfidence > 0.70 && (bestPatternScore > 0.80 || isVeryPopular)) {
                state.status = 'guessing';
                return { state, nextQuestion: null, guess: bestCandidate };
            }

            // Early Exit (20 questions rule)
            if (state.turnCount > 19 && maxConfidence > 0.6) {
                state.status = 'guessing';
                return { state, nextQuestion: null, guess: bestCandidate };
            }
        }

        // Exhaustion check
        if (state.candidates.length === 0) {
            state.status = 'failure';
            return { state, nextQuestion: null, guess: null };
        }

        if (state.candidates.length === 1) {
            state.status = 'guessing';
            return { state, nextQuestion: null, guess: state.candidates[0] };
        }

        // 2. QUESTION SELECTION
        const askedIds = state.history.map(h => h.questionId);
        const askedFeatureKeys = state.history.map(h => h.featureKey);

        // SMART STRATEGY: Phased Questioning (Difficulty Ladder)
        let prioritizedQuestions = allQuestions;

        // Phase 1: Core / Category (Turns 0-3) - "Easy"
        if (state.turnCount < 4) {
            prioritizedQuestions = allQuestions.filter(q =>
                q.tags?.includes('core') ||
                ['is_real', 'is_person', 'is_youtuber', 'is_actor', 'is_singer', 'is_athlete', 'is_fictional'].includes(q.featureKey)
            );
        }
        // Phase 2: Profession / Attributes (Turns 4-8) - "Medium"
        else if (state.turnCount < 9) {
            prioritizedQuestions = allQuestions.filter(q =>
                q.tags?.includes('profession') ||
                q.tags?.includes('hobby') ||
                q.tags?.includes('appearance') ||
                q.tags?.includes('core') // Keep core in mix if missed
            );
        }
        // Phase 3: Specifics (Turn 9+) - "Hard"
        else {
            prioritizedQuestions = allQuestions; // Open the floodgates
        }

        // Filter out already asked from the prioritized set
        let availableQs = prioritizedQuestions.filter(q => !askedIds.includes(q.id));

        // Fallback: If prioritized list is empty, revert to ALL unasked questions
        if (availableQs.length === 0) {
            availableQs = allQuestions.filter(q => !askedIds.includes(q.id));
        }

        const nextQ = EntropyEngine.selectBestQuestion(
            availableQs,
            state.candidates,
            askedIds,
            askedFeatureKeys,
            { featureKey: lastAnswer.featureKey, answer: lastAnswer.answer as string }
        );

        // Fallback or Copilot
        if (!nextQ) {
            // Try Copilot Generation? For now just fail graceful
            console.warn("No good questions left. Triggering Guess.");
            state.status = 'guessing';
            // Pick highest score
            return { state, nextQuestion: null, guess: bestCandidate };
        }

        return { state, nextQuestion: nextQ, guess: null };
    }

    /**
     * 9. LEARNING AFTER WRONG GUESS
     */
    static async handleWrongGuess(
        state: SessionState,
        wrongEntity: Entity,
        correctEntityName: string,
        theme: string
    ) {
        // 1. Call Copilot to diff
        const newQuestions = await CopilotEngine.differentiate(wrongEntity, correctEntityName, theme);

        // 2. Add Entity (Placeholder - would need DB write)
        // 3. Store Pattern
        if (correctEntityName) {
            // Find ID if exists
            const db = Persistence.load();
            const existing = db.entities.find(e => e.name.toLowerCase() === correctEntityName.toLowerCase());
            const targetId = existing ? existing.id : `temp_${Date.now()}`; // Placeholder until real creation implemented

            // Learn Pattern
            PatternEngine.learnPattern(state.history, targetId, 1.0, theme);
        }

        return newQuestions;
    }
}
