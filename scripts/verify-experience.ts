
import { ExperimentManager } from '../src/lib/engine/experimentManager';
import { MathUtils } from '../src/lib/utils/mathUtils';
import { OptimizationEngine } from '../src/lib/engine/cores/optimizationEngine';

async function runTest() {
    console.log("--- EXPERIENCE INTELLIGENCE VERIFICATION ---");

    // 1. A/B Testing
    console.log("\n1. Testing Experiment Assignment...");
    const exp1 = ExperimentManager.assignGroup('s1');
    const exp2 = ExperimentManager.assignGroup('s2');
    console.log(`Session 1 Group: ${exp1.group}`);
    console.log(`Session 2 Group: ${exp2.group}`);
    // Stats check: run 100 times, check roughly 50/50? No, simpler validation.
    if (exp1.group === 'A' || exp1.group === 'B') {
        console.log("✅ SUCCESS: Group assigned.");
    }

    // 2. Vector Math
    console.log("\n2. Testing MathUtils (Vectors)...");
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0]; // Identical
    const v3 = [0, 1, 0]; // Orthogonal

    const sim1 = MathUtils.cosineSimilarity(v1, v2); // Should be 1
    const sim2 = MathUtils.cosineSimilarity(v1, v3); // Should be 0

    console.log(`Sim(v1,v2) = ${sim1}`);
    console.log(`Sim(v1,v3) = ${sim2}`);

    if (sim1 > 0.99 && sim2 < 0.01) {
        console.log("✅ SUCCESS: Cosine Similarity works.");
    } else {
        console.error("❌ FAILURE: Vector Math broken.");
    }

    // 3. Self-Healing
    console.log("\n3. Testing Self-Healing...");
    const badMetrics = { avg_turns: 10, success_rate: 0.5 }; // Degraded
    const overrides = OptimizationEngine.checkSystemHealth(badMetrics);

    console.log("Overrides:", overrides);
    if (overrides.entropy_multiplier && overrides.entropy_multiplier > 1.0) {
        console.log("✅ SUCCESS: Healing triggered (Entropy Boost).");
    } else {
        console.error("❌ FAILURE: Healing logic failed.");
    }
}

runTest();
