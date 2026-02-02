
import { VectorStore } from '../src/lib/engine/vectorStore';
import { EmbeddingService } from '../src/lib/engine/embeddingService';
import { OptimizationEngine } from '../src/lib/engine/cores/optimizationEngine';

async function runTest() {
    console.log("--- SEMANTIC INTELLIGENCE VERIFICATION ---");

    // 1. Vector Store
    console.log("\n1. Testing Vector Store...");
    const store = VectorStore.getInstance();
    store.add("A", [1, 0, 0]);
    store.add("B", [0.9, 0.1, 0]); // Similar to A
    store.add("C", [0, 1, 0]);     // Different

    const results = await store.search([1, 0, 0]);
    console.log("Search Results:", results);

    if (results[0].id === "A" && results[1].id === "B") {
        console.log("✅ SUCCESS: Vector Search works (A then B).");
    } else {
        console.error("❌ FAILURE: Vector Search order wrong.");
    }

    // 2. Embedding Service
    console.log("\n2. Testing Embedding Service...");
    const vec = await EmbeddingService.getEmbedding("Hello World");
    if (vec.length > 0) {
        console.log(`✅ SUCCESS: Generated embedding (len: ${vec.length})`);
    }

    // 3. Plateau Breaker
    console.log("\n3. Testing Plateau Breaker...");
    // Create a flat confidence log
    const flatLog = [0.50, 0.51, 0.52]; // +0.02 gain < 0.05 threshold
    const overrides = OptimizationEngine.checkPlateau(flatLog);

    if (overrides.entropy_multiplier && overrides.entropy_multiplier > 1.2) {
        console.log("✅ SUCCESS: Plateau Breaker triggered.");
    } else {
        console.error("❌ FAILURE: Plateau Logic ignored flatlog.");
    }
}

runTest();
