
import { PatternEngine } from '../src/lib/engine/cores/patternEngine';
import { UserAnswer } from '../src/lib/engine/types';

// Mock Data
const mockHistory: UserAnswer[] = [
    { questionId: 'q1', featureKey: 'is_real', answer: 'Yes', timestamp: 1, timeTaken: 100 },
    { questionId: 'q2', featureKey: 'is_actor', answer: 'Yes', timestamp: 2, timeTaken: 100 },
    { questionId: 'q3', featureKey: 'is_indian', answer: 'Yes', timestamp: 3, timeTaken: 100 }
];

const targetEntityId = 'test_shah_rukh_khan';

async function runTest() {
    console.log("--- PREDICTIVE ENGINE VERIFICATION ---");

    // 1. Test Learning
    console.log("1. Learning Pattern for ID:", targetEntityId);
    // Confidence 0.9 (Should be accepted)
    PatternEngine.learnPattern(mockHistory, targetEntityId, 0.9, 'test_theme');

    // 2. Test Retrieval
    console.log("2. Retrieving Matches for same history...");
    const matches = PatternEngine.findPatternMatches(mockHistory);

    console.log("Matches Found:", matches.size);
    matches.forEach((score, id) => {
        console.log(` - Entity: ${id}, Score: ${score.toFixed(3)}`);
    });

    if (matches.has(targetEntityId) && (matches.get(targetEntityId) || 0) > 0.8) {
        console.log("✅ SUCCESS: Pattern learned and retrieved with high confidence.");
    } else {
        console.error("❌ FAILURE: Pattern not found or score too low.");
        process.exit(1);
    }
}

runTest();
