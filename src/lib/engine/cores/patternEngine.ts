import { Entity, UserAnswer } from "../types";
import { Persistence } from "../persistence";

export interface GamePattern {
    id: string;
    entityId: string;
    vector: number[];
    theme?: string; // e.g. "Bollywood", "Superheroes"
    success_rate?: number; // 0.0 to 1.0
    usageCount: number;
    lastUsed: number;
}

// Load Patterns from DB
let PATTERN_DB: GamePattern[] | null = null;

function getPatterns() {
    if (!PATTERN_DB) {
        const db = Persistence.load();
        PATTERN_DB = db.patterns || [];
    }
    return PATTERN_DB;
}

export class PatternEngine {

    /**
     * Encodes a sequence of answers into a numerical vector.
     */
    static encodeHistory(history: UserAnswer[]): number[] {
        return history.map(h => {
            switch (h.answer) {
                case 'Yes': return 1.0;
                case 'Probably': return 0.75;
                case 'Dont Know': return 0.5;
                case 'Probably Not': return 0.25;
                case 'No': return 0.0;
                default: return 0.5;
            }
        });
    }

    /**
     * Calculates Cosine Similarity between two vectors.
     * Note: Vectors might be different lengths, we trunc/pad to match.
     */
    static calculateSimilarity(vecA: number[], vecB: number[]): number {
        const len = Math.min(vecA.length, vecB.length);
        if (len === 0) return 0;

        let dot = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < len; i++) {
            dot += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }

        if (magA === 0 || magB === 0) return 0;
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    /**
     * Scans the database for patterns matching the current session history.
     */
    static findPatternMatches(history: UserAnswer[]): Map<string, number> { // EntityId -> Score
        const currentVector = this.encodeHistory(history);
        const matches = new Map<string, number>();

        // Only checking if we have substantial history (e.g. 3+ answers)
        if (currentVector.length < 3) return matches;

        const patterns = getPatterns();

        for (const pattern of patterns) {
            // We only compare the prefix of the pattern matching current turn count
            const storedPrefix = pattern.vector.slice(0, currentVector.length);
            const similarity = this.calculateSimilarity(currentVector, storedPrefix);

            // Boost by usage count (logarithmic scale) to favor common patterns
            const popularityBoost = Math.log(pattern.usageCount + 1) * 0.05;

            const finalScore = similarity + popularityBoost;

            if (finalScore > 0.8) { // Threshold
                // Accumulate score (keep max if multiple patterns for same entity)
                const existing = matches.get(pattern.entityId) || 0;
                matches.set(pattern.entityId, Math.max(existing, finalScore));
            }
        }

        return matches;
    }

    /**
     * Learn: Save the current game pattern to the DB.
     * Logic: If a similar pattern exists for this entity, merge/update it.
     * Else create new.
     * 
     * @param history User answers
     * @param entityId Predicted entity ID
     * @param confidence Final confidence score (Must be > 0.8 to learn)
     * @param theme Optional theme context
     */
    static learnPattern(history: UserAnswer[], entityId: string, confidence: number, theme: string = 'general') {

        // RULE: Only learn high-confidence patterns
        if (confidence < 0.80) {
            console.log(`PATTERN ENGINE: Skipping low confidence pattern (${confidence.toFixed(2)})`);
            return;
        }

        const newVector = this.encodeHistory(history);

        // Reload to ensure freshness
        const db = Persistence.load();
        PATTERN_DB = db.patterns || []; // Update cache

        // Find existing patterns for this entity
        const existingPattern = PATTERN_DB.find(p => p.entityId === entityId);

        let updated = false;

        if (existingPattern) {
            // Check if vectors are similar enough to be the " same pattern"
            const sim = this.calculateSimilarity(newVector, existingPattern.vector);
            if (sim > 0.85) {
                // Update existing
                existingPattern.usageCount++;
                existingPattern.lastUsed = Date.now();
                updated = true;
            }
        }

        if (!updated) {
            // Memory Cap (LRU Eviction)
            const MAX_PATTERNS = 50;
            if (PATTERN_DB.length >= MAX_PATTERNS) {
                // Find oldest used
                PATTERN_DB.sort((a, b) => a.lastUsed - b.lastUsed);
                PATTERN_DB.shift(); // Remove oldest
            }

            // Create new
            const newPattern: GamePattern = {
                id: `pat_${Date.now()}`,
                entityId,
                vector: newVector,
                theme,
                success_rate: 1.0, // Initial success
                usageCount: 1,
                lastUsed: Date.now()
            };
            PATTERN_DB.push(newPattern);
            console.log(`PATTERN ENGINE: Learned new pattern for ${entityId}`);
        }

        // SAVE TO DISK
        const entities = db.entities;
        const categories = db.categories || [];
        Persistence.save({ entities, categories, patterns: PATTERN_DB });
    }
}
