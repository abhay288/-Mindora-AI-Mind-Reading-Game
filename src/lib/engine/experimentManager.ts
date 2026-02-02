
import { EngineConfig, ConfigManager } from "./configManager";

export interface Experiment {
    id: string;
    group: 'A' | 'B';
    configOverrides: Partial<EngineConfig>;
}

export class ExperimentManager {
    static assignGroup(sessionId: string): Experiment {
        // Simple consistent hash or random for now
        const isGroupB = Math.random() < 0.5;

        if (isGroupB) {
            return {
                id: 'exp_weight_var_001',
                group: 'B',
                configOverrides: {
                    // Group B: Slightly more aggressive Rule & ML usage
                    rule_weight: (ConfigManager.loadConfig().rule_weight || 0.25) + 0.05,
                    ml_weight: 0.10,
                    fuzzy_weight: (ConfigManager.loadConfig().fuzzy_weight || 0.15) - 0.05
                }
            };
        }

        return {
            id: 'exp_weight_var_001',
            group: 'A',
            configOverrides: {} // Control group uses default
        };
    }

    static applyExperiment(config: EngineConfig, experiment: Experiment): EngineConfig {
        return { ...config, ...experiment.configOverrides };
    }
}
