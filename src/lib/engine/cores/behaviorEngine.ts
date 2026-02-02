import { UserAnswer, BehavioralProfile } from "../types";

/**
 * 7. BEHAVIORAL PATTERN ANALYSIS ENGINE
 * Purpose: Track subtle signals like answer speed and hesitation.
 */
export class BehaviorEngine {

    static analyze(history: UserAnswer[]): BehavioralProfile {
        if (history.length === 0) {
            return {
                avgTimeTaken: 0,
                hesitationCount: 0,
                uncertaintyCount: 0,
                pattern: 'Logical' // Default
            };
        }

        let totalTime = 0;
        let uncertaintyCount = 0;
        let hesitationCount = 0;

        history.forEach(ans => {
            const t = ans.timeTaken || 1000;
            totalTime += t;

            if (ans.answer === 'Probably' || ans.answer === 'Probably Not' || ans.answer === 'Dont Know') {
                uncertaintyCount++;
            }

            if (t > 3000) { // Took longer than 3s
                hesitationCount++;
            }
        });

        const avgTimeTaken = totalTime / history.length;

        // Determine Pattern
        let pattern: BehavioralProfile['pattern'] = 'Logical';

        if (avgTimeTaken < 1500 && uncertaintyCount === 0) pattern = 'Impulsive';
        else if (avgTimeTaken < 2000) pattern = 'Decisive';
        else if (uncertaintyCount > history.length * 0.4) pattern = 'Uncertain';
        else if (hesitationCount > history.length * 0.3) pattern = 'Random'; // Rough heuristic

        return {
            avgTimeTaken,
            hesitationCount,
            uncertaintyCount,
            pattern
        };
    }
}
