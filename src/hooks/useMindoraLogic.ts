import { useGameStore } from "@/lib/store";
import { FeatureValue } from "@/lib/engine/types";

export function useMindoraLogic() {
    const { confidence, updateConfidence } = useGameStore();

    // MOCK LOGIC: In a real app, this wraps Supabase Vector + Fuzzy Search
    const calculateNextConfidence = (answer: FeatureValue) => {
        // 1. Fuzzy Logic Simulation
        // 2. ML Simulation
        // 3. Fusion

        let delta = 0;
        switch (answer) {
            case 'Yes': delta = 0.15; break;
            case 'No': delta = -0.05; break; // Filter out
            case 'Probably': delta = 0.1; break;
            case 'Probably Not': delta = -0.02; break;
            case 'Dont Know': delta = 0; break;
        }

        // Clamp 0 to 1
        const newConfidence = Math.min(Math.max(confidence + delta, 0), 1);
        updateConfidence(newConfidence);

        return newConfidence;
    };

    return {
        calculateNextConfidence
    };
}
