import { useGameStore } from "@/lib/store";

export function useMindoraLogic() {
    const { confidence, updateConfidence } = useGameStore();

    // MOCK LOGIC: In a real app, this wraps Supabase Vector + Fuzzy Search
    const calculateNextConfidence = (answer: 'yes' | 'no' | 'dont_know' | 'probably' | 'probably_not') => {
        // 1. Fuzzy Logic Simulation
        // 2. ML Simulation
        // 3. Fusion

        let delta = 0;
        switch (answer) {
            case 'yes': delta = 0.15; break;
            case 'no': delta = -0.05; break; // Filter out
            case 'probably': delta = 0.1; break;
            case 'probably_not': delta = -0.02; break;
            case 'dont_know': delta = 0; break;
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
