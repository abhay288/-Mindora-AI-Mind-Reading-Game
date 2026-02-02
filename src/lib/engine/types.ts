export type FeatureValue = 'Yes' | 'No' | 'Probably' | 'Probably Not' | 'Dont Know';

export interface Category {
    id: string;
    name: string;
    icon: string; // Emoji or Lucide icon name
    search_tags: string[];
}

export interface Entity {
    id: string;
    name: string;
    category_id: string; // Foreign Key
    description: string; // Short description
    imageUrl?: string;
    is_public_figure: boolean;
    features: Record<string, FeatureValue>;
    embedding?: number[];
    popularity: number; // 0.0 to 1.0 (Prior)
    score?: number; // Real-time probability score
    created_at?: number;
    learning_boost?: number; // Dynamic reinforcement score
}

export interface Question {
    id: string;
    text: { en: string; hi: string; };
    featureKey: string;

    // Adaptive Fields
    tags?: string[]; // e.g. ['animal', 'flying']
    quality_score?: number; // 0.0 - 1.0
    entropy_score?: number; // dynamic
    positive_next_tags?: string[]; // If Yes -> Prioritize these
    negative_next_tags?: string[]; // If No -> Prioritize these
    usage_count?: number;

    // Perception Layer
    variants?: { en: string; hi: string }[]; // Alternative phrasings localized
    tone?: 'formal' | 'casual' | 'playful';
}

export interface Rule {
    id: string;
    type: 'exclusion' | 'boost';
    condition: { feature: string; value: FeatureValue; };
    effect: { targetFeature?: string; targetValue?: FeatureValue; multiplier?: number; };
}

export interface UserAnswer {
    questionId: string;
    featureKey: string;
    answer: FeatureValue;
    timestamp: number; // For behavioral analysis
    timeTaken?: number; // ms taken to answer
}

export interface BehavioralProfile {
    avgTimeTaken: number;
    hesitationCount: number;
    uncertaintyCount: number; // How many "Probably"/"Don't Know"
    pattern: 'Decisive' | 'Uncertain' | 'Random' | 'Logical' | 'Impulsive';
}

export interface SessionState {
    history: UserAnswer[];
    candidates: Entity[];
    behavior: BehavioralProfile;
    scores: Record<string, {
        rule: number;
        fuzzy: number;
        bayesian: number;
        ml: number;
        intent: number; // Predictive Intent Score
        final: number;
    }>;
    status: 'playing' | 'guessing' | 'success' | 'failure';
    turnCount: number;
    confidence: number;
    context?: { // Adaptive Context
        region: string;
        sessionMemory?: { theme: string; playCount: number; };
    };
}
