
import { MindoraEngine } from '../src/lib/engine/cores/mindoraEngine';
import { EntropyEngine } from '../src/lib/engine/cores/entropyEngine';
import { Entity, Question } from '../src/lib/engine/types';

// Mock Data
const candidates: Entity[] = [
    { id: '1', name: 'Shah Rukh Khan', category_id: 'cat_bollywood', description: 'King', popularity: 0.9, is_public_figure: true, features: {}, learning_boost: 0, score: 0 },
    { id: '2', name: 'Iron Man', category_id: 'cat_fictional', description: 'Hero', popularity: 0.9, is_public_figure: true, features: {}, learning_boost: 0, score: 0 }
];

const questions: Question[] = [
    { id: 'q1', text: { en: 'Is it real?', hi: '' }, featureKey: 'is_real', usage_count: 0 },
    { id: 'q2', text: { en: 'Is it tired?', hi: '' }, featureKey: 'is_tired', usage_count: 10 } // High usage
];

async function runTest() {
    console.log("--- ADAPTIVE INTELLIGENCE VERIFICATION ---");

    // 1. Test Session/Region Boost
    console.log("\n1. Testing Session & Region Boosts...");
    const state = MindoraEngine.initializeSession(candidates, {
        region: 'IN',
        sessionMemory: { theme: 'Bollywood', playCount: 2 }
    });

    const srk = state.candidates.find(c => c.id === '1');
    const ironman = state.candidates.find(c => c.id === '2');

    console.log(`SRK Score (Target Boosted): ${srk?.score}`);
    console.log(`Iron Man Score (Base): ${ironman?.score}`);

    if ((srk?.score || 0) > (ironman?.score || 0)) {
        console.log("✅ SUCCESS: Regional/Session boost applied correctly.");
    } else {
        console.error("❌ FAILURE: Boost logic failed.");
    }

    // 2. Test Question Fatigue
    console.log("\n2. Testing Question Fatigue...");
    const asked: string[] = [];
    const bestQ = EntropyEngine.selectBestQuestion(questions, candidates, asked);

    console.log(`Selected Question: ${bestQ?.id}`);

    if (bestQ?.id === 'q1') {
        console.log("✅ SUCCESS: Fresh question selected over tired one.");
    } else {
        console.error("❌ FAILURE: Fatigue logic failed, selected high-usage question.");
    }
}

runTest();
