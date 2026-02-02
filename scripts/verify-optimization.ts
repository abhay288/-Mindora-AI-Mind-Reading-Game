
import { ConfigManager } from '../src/lib/engine/configManager';
import { AnalyticsUtils } from '../src/lib/engine/analyticsUtils';
import { OptimizationEngine } from '../src/lib/engine/cores/optimizationEngine';
import { MindoraEngine } from '../src/lib/engine/cores/mindoraEngine';
import { Entity } from '../src/lib/engine/types';

async function runTest() {
    console.log("--- OPTIMIZATION LAYER VERIFICATION ---");

    // 1. Config Manager Test
    console.log("\n1. Testing Config Manager...");
    const originalConfig = ConfigManager.loadConfig();
    console.log("Original Rule Weight:", originalConfig.rule_weight);

    // Modify
    ConfigManager.updateWeight('rule_weight', 0.99);
    const newConfig = ConfigManager.loadConfig();
    console.log("New Rule Weight:", newConfig.rule_weight);

    if (newConfig.rule_weight === 0.99) {
        console.log("✅ SUCCESS: Config updated.");
    } else {
        console.error("❌ FAILURE: Config update failed.");
    }

    // Restore
    ConfigManager.updateWeight('rule_weight', originalConfig.rule_weight);

    // 2. Analytics Test
    console.log("\n2. Testing Analytics Logging...");
    AnalyticsUtils.logSession({
        id: 'test_sess',
        timestamp: Date.now(),
        theme: 'Test',
        region: 'US',
        final_confidence: 0.8,
        turns: 5,
        success: true,
        avg_decision_time: 100
    });

    const metrics = AnalyticsUtils.getMetrics();
    console.log("Metrics:", metrics);

    if (metrics && metrics.total_games > 0) {
        console.log("✅ SUCCESS: Analytics logged and retrieved.");
    } else {
        console.error("❌ FAILURE: Analytics retrieval failed.");
    }

    // 3. Health Score Test
    console.log("\n3. Testing Health Calculation...");
    const entities: Entity[] = [{
        id: 'e1', name: 'Test Entity', category_id: 'c1', description: 'desc',
        popularity: 0.5, is_public_figure: true, features: {},
        guess_success_rate: 0.8 // High success
    }];

    const optimized = OptimizationEngine.recalculateEntityHealth(entities);
    console.log("Health Score:", optimized[0].health_score);

    if ((optimized[0].health_score || 0) > 80) {
        console.log("✅ SUCCESS: Health score calculated correctly.");
    } else {
        console.error("❌ FAILURE: Health score calculation wrong.");
    }
}

runTest();
