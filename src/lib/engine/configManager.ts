
import { Persistence } from "./persistence";

export interface EngineConfig {
    rule_weight: number;
    bayesian_weight: number; // New
    ml_weight: number;
    fuzzy_weight: number;
    pattern_weight: number;

    // Adaptive Caps
    region_boost_cap: number;
    session_boost_cap: number;

    // Multipliers
    entropy_multiplier: number;
    novelty_multiplier: number;

    // Thresholds
    confidence_threshold_hard: number; // 0.85
    confidence_threshold_soft: number; // 0.70
}

const DEFAULT_CONFIG: EngineConfig = {
    rule_weight: 0.25,
    bayesian_weight: 0.25,
    ml_weight: 0.0, // Currently 0 in code, mainly placeholder
    fuzzy_weight: 0.15,
    pattern_weight: 0.10,

    region_boost_cap: 0.15,
    session_boost_cap: 0.15,

    entropy_multiplier: 1.0,
    novelty_multiplier: 1.0,

    confidence_threshold_hard: 0.85,
    confidence_threshold_soft: 0.70
};

export class ConfigManager {
    static loadConfig(): EngineConfig {
        return Persistence.loadFile<EngineConfig>('config.json', DEFAULT_CONFIG);
    }

    static saveConfig(config: EngineConfig) {
        Persistence.saveFile('config.json', config);
    }

    static updateWeight(key: keyof EngineConfig, value: number) {
        const config = this.loadConfig();
        config[key] = value;
        this.saveConfig(config);
    }

    static getEffectiveConfig(overrides: Partial<EngineConfig> = {}): EngineConfig {
        const base = this.loadConfig();
        return { ...base, ...overrides };
    }
}
