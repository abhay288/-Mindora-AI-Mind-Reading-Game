import { Entity, Question, Rule } from "../types";

/**
 * 9. LEARNING SYSTEM ENGINE
 * Purpose: Handle corrections, deduplication, and new entity ingestion.
 */
export class LearningEngine {

    static learnNewEntity(
        currentEntities: Entity[],
        newEntityData: { name: string; description: string },
        diffQuestion: { text: string; answerForNew: 'Yes' | 'No'; answerForOld: 'Yes' | 'No' },
        wrongGuessId: string
    ) {
        // 1. Deduplication Check (Mock Vector Sim)
        // In real app, check if embedding(newEntity) sim embedding(existing) > 0.95
        const duplicate = currentEntities.find(e => e.name.toLowerCase() === newEntityData.name.toLowerCase());
        if (duplicate) {
            return { status: 'duplicate', entity: duplicate };
        }

        // 2. Create New Entity
        const newId = `custom_${Date.now()}`;
        const newEntity: Entity = {
            id: newId,
            name: newEntityData.name,
            description: newEntityData.description,
            features: {}, // Will be populated by the diff question + inherited history
            popularity: 0.1, // Start low/novel
            category_id: 'uncategorized', // Default
            is_public_figure: false, // Default safety
        };

        // 3. Create New Question
        const qId = `q_custom_${Date.now()}`;
        const newQuestion: Question = {
            id: qId,
            text: { en: diffQuestion.text, hi: diffQuestion.text }, // Auto-trans later
            featureKey: `feat_${qId}`,
            entropy_score: 1.0 // High value initially to differentiate
        };

        // 4. Assign Features
        newEntity.features[newQuestion.featureKey] = diffQuestion.answerForNew;

        // Update Wrong Guess Entity too
        const wrongEntity = currentEntities.find(e => e.id === wrongGuessId);
        if (wrongEntity) {
            wrongEntity.features[newQuestion.featureKey] = diffQuestion.answerForOld;
        }

        return {
            status: 'learned',
            newEntity,
            newQuestion,
            updatedWrongEntity: wrongEntity
        };
    }
}
