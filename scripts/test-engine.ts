
import { MindoraEngine } from "../src/lib/engine/cores/mindoraEngine";
import { Entity, Question } from "../src/lib/engine/types";

// MOCK DATA
const candidates: Entity[] = [
    { id: 'e1', name: 'Lion', category_id: 'cat_animal', description: 'Big Cat', popularity: 0.9, is_public_figure: false, created_at: Date.now(), features: { 'is_animal': 'Yes', 'can_fly': 'No', 'has_fur': 'Yes', 'is_dangerous': 'Yes' } },
    { id: 'e2', name: 'Eagle', category_id: 'cat_animal', description: 'Bird', popularity: 0.7, is_public_figure: false, created_at: Date.now(), features: { 'is_animal': 'Yes', 'can_fly': 'Yes', 'has_fur': 'No', 'is_dangerous': 'Yes' } },
    { id: 'e3', name: 'Airplane', category_id: 'cat_machine', description: 'Machine', popularity: 0.8, is_public_figure: false, created_at: Date.now(), features: { 'is_animal': 'No', 'can_fly': 'Yes', 'has_fur': 'No', 'is_dangerous': 'Probably' } },
    { id: 'e4', name: 'Dog', category_id: 'cat_animal', description: 'Pet', popularity: 0.95, is_public_figure: false, created_at: Date.now(), features: { 'is_animal': 'Yes', 'can_fly': 'No', 'has_fur': 'Yes', 'is_dangerous': 'No' } }
];

const questions: Question[] = [
    { id: 'q1', text: { en: 'Is it an animal?', hi: '' }, featureKey: 'is_animal', quality_score: 0.9 },
    { id: 'q2', text: { en: 'Can it fly?', hi: '' }, featureKey: 'can_fly', quality_score: 0.9 },
    { id: 'q3', text: { en: 'Does it have fur?', hi: '' }, featureKey: 'has_fur', quality_score: 0.8 },
    { id: 'q4', text: { en: 'Is it dangerous?', hi: '' }, featureKey: 'is_dangerous', quality_score: 0.7 }
];

async function runSimulation() {
    console.log("--- STARTING MINDORA ENGINE SIMULATION ---");

    // 1. Initialize
    let state = MindoraEngine.initializeSession(candidates);
    console.log(`Initialized with ${state.candidates.length} candidates.`);

    // Simulate User thinking of "Eagle"
    const target = candidates[1];
    console.log(`TARGET ENTITY: ${target.name}`);

    // Turn 1
    // Manually picking first question for test stability, normally suggested by Engine
    let currentQ = questions[0]; // Is it an animal?
    console.log(`\nQ1: ${currentQ.text.en}`);

    // Answer: Yes
    let ans = { questionId: currentQ.id, featureKey: currentQ.featureKey, answer: 'Yes' as any, timestamp: Date.now() };
    let result = await MindoraEngine.evaluateTurn(state, ans, questions);
    state = result.state;

    console.log("Turn 1 Result:");
    state.candidates.forEach(c => console.log(` - ${c.name}: Score ${c.score?.toFixed(3)}`));

    if (result.guess) {
        console.log(`GUESS: ${result.guess.name}`);
        return;
    }

    // Turn 2
    currentQ = result.nextQuestion!;
    console.log(`\nQ2: ${currentQ.text.en}`);
    // Assume Q2 is "Can it fly?" (High Entropy) -> Yes
    ans = { questionId: currentQ.id, featureKey: currentQ.featureKey, answer: 'Yes' as any, timestamp: Date.now() };

    result = await MindoraEngine.evaluateTurn(state, ans, questions);
    state = result.state;

    console.log("Turn 2 Result:");
    activeLog(state);

    if (result.guess) {
        console.log(`GUESS: ${result.guess.name}`);
        return;
    }

    // Turn 3
    currentQ = result.nextQuestion!;
    console.log(`\nQ3: ${currentQ.text.en}`);
    // Assume Q3 is "Is it dangerous?" -> Yes
    ans = { questionId: currentQ.id, featureKey: currentQ.featureKey, answer: 'Yes' as any, timestamp: Date.now() };

    result = await MindoraEngine.evaluateTurn(state, ans, questions);
    state = result.state;

    console.log("Turn 3 Result:");
    activeLog(state);

    if (result.guess) {
        if (result.guess.name === 'Eagle') {
            console.log(`\n✅ SUCCESS: Correctly guessed Eagle!`);
        } else {
            console.error(`\n❌ FAILURE: Guessed ${result.guess.name} instead of Eagle.`);
        }
    } else {
        console.error("\n❌ FAILURE: Did not reach a guess within 3 turns.");
    }
}

function activeLog(state: any) {
    state.candidates.forEach((c: any) => console.log(` - ${c.name}: Score ${c.score?.toFixed(3)}`));
}

runSimulation();
