
import { GovernanceEngine } from '../src/lib/engine/governanceEngine';

console.log("--- MINDORA INSIGHT REPORT ---\n");
console.log("Running Governance Audit...");

const report = GovernanceEngine.generateReportFile();

console.log("\n--- AUDIT RESULTS ---");
console.log(`Health Score: ${report.healthScore}/100`);
console.log(`Stale Entities: ${report.staleEntities.length}`);
console.log(`Inconsistent Questions: ${report.inconsistentQuestions.length}`);

if (report.healthScore < 90) {
    console.warn("\n⚠️ SYSTEM HEALTH WARNING: Maintenance Suggested.");
} else {
    console.log("\n✅ SYSTEM STABLE.");
}
