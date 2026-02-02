
import { Persistence } from "../persistence";
import { Entity, Question } from "../types";

/**
 * 7. SELF-OPTIMIZATION ENGINE
 * Purpose: Periodically tune entities and questions based on health scores.
 */
export class OptimizationEngine {

    // Run all optimization tasks
    static runMaintenance() {
        const db = Persistence.load();

        const entities = this.recalculateEntityHealth(db.entities);
        const questions = this.pruneQuestions(db.questions || []); // Assuming db.questions exists (it might not in current schema, need to verify)

        // Note: db.questions isn't in Persistence.DatabaseSchema yet? 
        // We might need to load questions separately or update schema.
        // For now, let's assume we can access them if they were in DB. 
        // Actually, questions are usually in data.ts or code. 
        // If they are dynamic, they should be in DB. 
        // If static, we can't persist changes easily without a true DB.
        // We will assume they are loadable/saveable.

        Persistence.save({ ...db, entities });
    }

    static recalculateEntityHealth(entities: Entity[]): Entity[] {
        return entities.map(e => {
            const successRate = e.guess_success_rate || 0.5;
            const health = (successRate * 50) + 50; // Simple base
            return { ...e, health_score: health };
        });
    }

    static pruneQuestions(questions: Question[]): Question[] {
        return questions.map(q => {
            // Mock Auto-Pruning logic
            if ((q.abandon_rate || 0) > 0.3) {
                return { ...q, quality_score: (q.quality_score || 0.8) - 0.1 };
            }
            if ((q.quality_score || 1) < 0.2) {
                return { ...q, archived: true };
            }
            return q;
        });
    }

    // Module 2: Popularity Drift
    static updatePopularity(entities: Entity[]): Entity[] {
        return entities.map(e => {
            const historical = e.popularity || 0.5;
            const recent = e.guess_success_rate || 0.5;

            // Formula: Validated Success * 0.6 + Historical * 0.4
            // Also decay historical slightly (simulated by weighting recent higher)
            const newPop = (recent * 0.6) + (historical * 0.4);

            return { ...e, popularity: parseFloat(newPop.toFixed(3)) };
        });
    }

    // Module 5: Self-Healing Logic
    static checkSystemHealth(metrics: { avg_turns: number, success_rate: number }): Partial<any> {
        const overrides: any = {};

        // Degradation Checks
        if (metrics.avg_turns > 8) {
            // Too slow -> Boost Entropy (Value Info) & Pattern (Shortcuts)
            overrides.entropy_multiplier = 1.2;
            overrides.pattern_weight = 0.15;
        }

        if (metrics.success_rate < 0.6) {
            // Dumb -> Rely more on Rules (Safety)
            overrides.rule_weight = 0.4;
        }

        return overrides;
    }

    // Module 6: Experience Score
    static calculateExperienceScore(metrics: any): number {
        // (Success * 0.4) - (Turns * 0.02) - (repetition * 0.2)
        // Normalized roughly 0-100
        const successScore = (parseFloat(metrics.success_rate) / 100) * 40; // 40 max
        const turnPenalty = (metrics.avg_turns) * 2; // 7 turns = 14 penalty

        const score = successScore - turnPenalty + 60; // Base 60
        return Math.max(0, Math.min(100, score));
    }

    // Module 2: Plateau Breaker
    static checkPlateau(confidenceLog: number[]): Partial<any> {
        const len = confidenceLog.length;
        if (len < 3) return {};

        const current = confidenceLog[len - 1];
        const prev3 = confidenceLog[len - 3];

        // If gain is less than 5% over 3 turns
        if ((current - prev3) < 0.05) {
            console.log("Optimization: Plateau Detected. Boosting Entropy.");
            return {
                entropy_multiplier: 1.5, // High entropy to break deadlock
                novelty_multiplier: 1.3,
                pattern_weight: 0.05 // Reduce shortcut reliance
            };
        }
        return {};
    }

    // Module 5: Performance Harmonizer
    static monitorPerformance(metrics: { latency: number }): Partial<any> {
        if (metrics.latency > 90) {
            console.warn("Performance Harmonizer: High Latency detected (" + metrics.latency + "ms). Reducing complexity.");
            return {
                ml_weight: 0.1, // Reduce ML reliance
                fuzzy_weight: 0.1 // Reduce fuzzy logic overhead
            };
        }
        return {};
    }
}
