import { NextResponse } from 'next/server';
import { PatternEngine } from '@/lib/engine/cores/patternEngine';
import { MOCK_ENTITIES } from '@/lib/engine/data';
import { Entity } from '@/lib/engine/types';
import { Persistence } from '@/lib/engine/persistence';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { newCharacter, history } = body; // newCharacter: { name, description }, history: UserAnswer[]

        if (!newCharacter || !newCharacter.name || typeof newCharacter.name !== 'string') {
            return NextResponse.json({ error: "Invalid Character Data" }, { status: 400 });
        }

        // SANITIZATION
        const rawName = newCharacter.name.trim().slice(0, 60); // Max 60 chars
        const safeName = rawName.replace(/[<>]/g, ''); // Strip potential HTML tags

        if (safeName.length < 2) {
            return NextResponse.json({ error: "Name too short" }, { status: 400 });
        }

        console.log(`LEARNING: User teaching ${safeName}`);

        // RELOAD DB to ensure freshness
        const db = Persistence.load();
        const entities = db.entities.length > 0 ? db.entities : MOCK_ENTITIES;

        // 1. Check if Entity already exists (by name fuzzy match)
        let entity = entities.find(e => e.name.toLowerCase() === safeName.toLowerCase());

        if (entity) {
            // BOOST EXISTING
            console.log(`LEARNING: Boosting existing entity ${entity.name}`);
            entity.learning_boost = (entity.learning_boost || 0) + 2.0;
            entity.popularity += 0.5; // Small pop boost
        } else {
            // CREATE NEW
            console.log(`LEARNING: Creating new entity ${safeName}`);
            entity = {
                id: `learned_${Date.now()}`,
                name: safeName,
                description: newCharacter.description || 'Learned from user',
                category_id: 'cat_other',
                is_public_figure: false,
                popularity: 0.5,
                learning_boost: 2.0,
                features: {}
            };
            entities.push(entity);
        }

        // SAVE UPDATED ENTITIES
        Persistence.save({
            entities: entities,
            categories: db.categories || [],
            patterns: db.patterns || []
        });

        // 2. Learn Pattern
        if (history && history.length > 0) {
            PatternEngine.learnPattern(history, entity.id, 1.0, 'user_taught');
        }

        return NextResponse.json({
            success: true,
            message: `I have learned ${entity.name}! Next time I will be faster.`
        });

    } catch (error) {
        console.error("Teach Error:", error);
        return NextResponse.json({ error: "Learning Failed" }, { status: 500 });
    }
}
