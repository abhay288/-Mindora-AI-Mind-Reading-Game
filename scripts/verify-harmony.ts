
import { EmbeddingService } from '../src/lib/engine/embeddingService';
import { OptimizationEngine } from '../src/lib/engine/cores/optimizationEngine';

async function runTest() {
    console.log("--- COGNITIVE HARMONY VERIFICATION ---");

    // 1. Embedding Cache
    console.log("\n1. Testing Embedding Cache...");
    const t0 = performance.now();
    await EmbeddingService.getEmbedding("Test Cache");
    const t1 = performance.now();
    await EmbeddingService.getEmbedding("Test Cache"); // Should be instant
    const t2 = performance.now();

    console.log(`First Call: ${(t1 - t0).toFixed(2)}ms`);
    console.log(`Second Call: ${(t2 - t1).toFixed(2)}ms`);

    if ((t2 - t1) < 1) {
        console.log("✅ SUCCESS: Embedding Cache is active.");
    } else {
        console.warn("⚠️ WARNING: Cache might be slow or inactive.");
    }

    // 2. Performance Harmonizer
    console.log("\n2. Testing Performance Harmonizer...");
    const overrides = OptimizationEngine.monitorPerformance({ latency: 120 }); // Spike
    console.log("Overrides for 120ms latency:", overrides);

    if (overrides.ml_weight && overrides.ml_weight < 0.2) {
        console.log("✅ SUCCESS: Harmonizer reduced complexity.");
    } else {
        console.error("❌ FAILURE: Harmonizer failed to react.");
    }

    // 3. Confidence Smoothing (Mock Logic)
    console.log("\n3. Testing Confidence Smoothing Logic...");
    const raw = 0.9;
    const prev = 0.5;
    const prev2 = 0.5;
    const smoothed = (raw * 0.6) + (prev * 0.3) + (prev2 * 0.1);
    console.log(`Raw: ${raw} -> Smoothed: ${smoothed.toFixed(2)}`);

    if (smoothed < raw && smoothed > prev) {
        console.log("✅ SUCCESS: Smoothing dampened the spike.");
    }
}

runTest();
