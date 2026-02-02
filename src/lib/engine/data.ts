import { Entity, Question } from "./types";
import { Persistence } from "./persistence";

// Initial Mock Data (Defaults)
const DEFAULT_ENTITIES: Entity[] = [
    { id: '1', name: 'Shah Rukh Khan', category_id: 'cat_bollywood', description: 'King of Bollywood', popularity: 0.9, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'Yes', 'is_male': 'Yes', 'is_actor': 'Yes', 'is_indian': 'Yes' }, learning_boost: 0 },
    { id: '2', name: 'Iron Man', category_id: 'cat_fictional', description: 'Tony Stark', popularity: 0.95, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'No', 'is_male': 'Yes', 'can_fly': 'Yes', 'is_fictional': 'Yes' }, learning_boost: 0 },
    { id: '3', name: 'Narendra Modi', category_id: 'cat_politician', description: 'Prime Minister of India', popularity: 0.9, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'Yes', 'is_male': 'Yes', 'is_politician': 'Yes', 'is_indian': 'Yes' }, learning_boost: 0 },
    { id: '4', name: 'Doraemon', category_id: 'cat_fictional', description: 'Robot Cat', popularity: 0.85, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'No', 'is_animal': 'Yes', 'is_robot': 'Yes', 'is_male': 'Yes' }, learning_boost: 0 },
    { id: '5', name: 'Taylor Swift', category_id: 'cat_singer', description: 'Global Pop Star', popularity: 0.92, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'Yes', 'is_male': 'No', 'is_singer': 'Yes', 'is_american': 'Yes' }, learning_boost: 0 },
    { id: '6', name: 'Sherlock Holmes', category_id: 'cat_fictional', description: 'Famous Detective', popularity: 0.88, is_public_figure: true, created_at: Date.now(), features: { 'is_real': 'No', 'is_male': 'Yes', 'is_human': 'Yes', 'is_british': 'Yes' }, learning_boost: 0 }
];

// Load from DB or use Defaults
const db = Persistence.load();
let loadedEntities = db.entities;
let loadedQuestions = db.questions || [];

if (loadedEntities.length === 0) {
    // First time? Use defaults
    loadedEntities = [...DEFAULT_ENTITIES];
}

if (loadedQuestions.length === 0) {
    loadedQuestions = [
        // Core Category Splitting Questions
        { id: 'q_real', text: { en: "Is your character real?", hi: "क्या आपका पात्र वास्तविक है?" }, featureKey: 'is_real', tags: ['core'], quality_score: 1.0, entropy_score: 1.0 },
        { id: 'q_human', text: { en: "Is your character a human?", hi: "क्या आपका पात्र इंसान है?" }, featureKey: 'is_person', tags: ['core'], quality_score: 1.0, entropy_score: 0.9 },
        { id: 'q_male', text: { en: "Is your character male?", hi: "क्या आपका पात्र पुरुष है?" }, featureKey: 'is_male', tags: ['core'], quality_score: 0.9, entropy_score: 0.95 },
        { id: 'q_indian', text: { en: "Is your character from India?", hi: "क्या आपका पात्र भारत से है?" }, featureKey: 'is_indian', tags: ['origin'], quality_score: 0.85, entropy_score: 0.9 },

        // Profession / Category Questions
        { id: 'q_youtuber', text: { en: "Is your character a YouTuber?", hi: "क्या आपका पात्र YouTuber है?" }, featureKey: 'is_youtuber', tags: ['profession'], quality_score: 0.95, entropy_score: 0.8 },
        { id: 'q_actor', text: { en: "Is your character an actor?", hi: "क्या आपका पात्र अभिनेता है?" }, featureKey: 'is_actor', tags: ['profession'], quality_score: 0.9, entropy_score: 0.8 },
        { id: 'q_singer', text: { en: "Is your character a singer?", hi: "क्या आपका पात्र गायक है?" }, featureKey: 'is_singer', tags: ['profession'], quality_score: 0.9, entropy_score: 0.8 },
        { id: 'q_athlete', text: { en: "Is your character a sportsperson?", hi: "क्या आपका पात्र खिलाड़ी है?" }, featureKey: 'is_athlete', tags: ['profession'], quality_score: 0.9, entropy_score: 0.8 },
        { id: 'q_cricket', text: { en: "Does your character play cricket?", hi: "क्या आपका पात्र क्रिकेट खेलता है?" }, featureKey: 'plays_cricket', tags: ['profession', 'sport'], quality_score: 0.95, entropy_score: 0.7 },
        { id: 'q_politician', text: { en: "Is your character a politician?", hi: "क्या आपका पात्र राजनेता है?" }, featureKey: 'is_politician', tags: ['profession'], quality_score: 0.8, entropy_score: 0.6 },

        // Fictional / Other
        { id: 'q_fictional', text: { en: "Is your character fictional?", hi: "क्या आपका पात्र काल्पनिक है?" }, featureKey: 'is_fictional', tags: ['core'], quality_score: 1.0, entropy_score: 0.9 },
        { id: 'q_animal', text: { en: "Is your character an animal?", hi: "क्या आपका पात्र जानवर है?" }, featureKey: 'is_animal', tags: ['biology'], quality_score: 0.9, entropy_score: 0.8 },

        // Specifics
        { id: 'q_fly', text: { en: "Does your character have superpowers?", hi: "क्या आपके पात्र के पास महाशक्तियां हैं?" }, featureKey: 'can_fly', tags: ['fantasy'], quality_score: 0.7, entropy_score: 0.5 },
    ];
}

// Sync back to Persistence if it was empty
if (db.entities.length === 0 || !db.questions || db.questions.length === 0) {
    Persistence.save({
        entities: loadedEntities,
        questions: loadedQuestions,
        categories: db.categories,
        patterns: db.patterns
    });
}

export const MOCK_ENTITIES = loadedEntities;
export const MOCK_QUESTIONS = loadedQuestions;
