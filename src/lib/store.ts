import { create } from 'zustand';
import { Entity, Question, UserAnswer } from './engine/types';
import { AnalyticsUtils } from './engine/analyticsUtils';

// Types
export type GameState = 'intro' | 'theme-selection' | 'playing' | 'guessing' | 'victory' | 'defeat' | 'teach' | 'error';
export type CharacterState = 'idle' | 'thinking' | 'confused' | 'success' | 'celebrating' | 'sad';
export type Language = 'en' | 'hi';

// Undo History Snapshot
export interface UndoState {
    history: UserAnswer[];
    currentQuestion: Question | null;
    turnCount: number;
    confidence: number;
    // We don't snapshot random seeds but logic should allow replay if needed
}

interface GameStore {
    // UI State
    gameState: GameState;
    language: Language;
    theme: string;
    characterState: CharacterState;
    isLoading: boolean;

    // Logic State (AI)
    // Logic State (AI)
    confidence: number;
    turnCount: number;
    history: UserAnswer[];
    confidenceLog: number[]; // Trace for graph

    // Adaptive State
    sessionMemory: { theme: string; playCount: number };
    region: string;

    undoStack: UndoState[]; // History Stack for Back button

    errorMessage: string | null;

    // Dynamic Content from API
    currentQuestion: Question | null;
    guessResult: Entity | null;

    // Actions
    setGameState: (state: GameState) => void;
    setLanguage: (lang: Language) => void;
    setTheme: (theme: string) => void;
    setCharacterState: (state: CharacterState) => void;
    updateConfidence: (score: number) => void;
    undoLastAction: () => void;

    // Async Actions
    submitAnswer: (answer: string, timeTaken: number) => Promise<void>;
    confirmGuess: (isCorrect: boolean) => Promise<void>;
    resetGame: () => void;
}

import { ThemeManager } from './engine/themeManager';

// ...

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: 'intro',
    language: 'en',
    theme: ThemeManager.getSeasonalTheme().name, // Initial Season Theme
    characterState: 'idle',
    isLoading: false,
    confidence: 0,
    turnCount: 0,
    history: [],
    confidenceLog: [],
    undoStack: [],
    errorMessage: null,
    currentQuestion: null,
    guessResult: null,

    // Session Intelligence
    sessionMemory: { theme: '', playCount: 0 },
    region: 'IN', // Default, will detect

    setGameState: (state) => set({ gameState: state }),
    setLanguage: (lang) => set({ language: lang }),
    setTheme: (theme) => {
        const { sessionMemory } = get();

        // Update Session Streak
        let newPlayCount = 1;
        if (sessionMemory.theme === theme) {
            newPlayCount = sessionMemory.playCount + 1;
        }

        const newSession = { theme, playCount: newPlayCount };

        // Auto-detect region if not set (Mock implementation)
        // In real app, use an API or navigator.language
        const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
        const detectedRegion = browserLang.includes('IN') || browserLang.includes('hi') ? 'IN' : 'US';

        set({
            theme,
            gameState: 'playing',
            turnCount: 0,
            history: [],
            undoStack: [],
            isLoading: true,
            sessionMemory: newSession,
            region: detectedRegion
        });

        // Initial Question Fetch (Empty History)
        get().submitAnswer('INIT', 0);
    },
    setCharacterState: (state) => set({ characterState: state }),
    updateConfidence: (score) => set((state) => ({
        confidence: score,
        confidenceLog: [...state.confidenceLog, score]
    })),

    undoLastAction: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;

        // Pop last state
        const lastState = undoStack[undoStack.length - 1];
        const newStack = undoStack.slice(0, -1);

        set({
            history: lastState.history,
            currentQuestion: lastState.currentQuestion,
            turnCount: lastState.turnCount,
            confidence: lastState.confidence,
            undoStack: newStack,
            gameState: 'playing', // Always return to playing if undoing
            guessResult: null, // Clear any potential guess results
        });
    },

    submitAnswer: async (answer: string, timeTaken: number) => {
        const { history, currentQuestion, turnCount, confidence } = get();

        // SNAPSHOT STATE before modifying (if not INIT)
        if (answer !== 'INIT') {
            const snapshot: UndoState = {
                history: [...history], // Copy
                currentQuestion,
                turnCount,
                confidence
            };

            // Limit Stack Size
            let newStack = [...get().undoStack, snapshot];
            if (newStack.length > 5) newStack.shift(); // Remove oldest

            set({ undoStack: newStack });
        }

        // 1. Update Local History (unless it's init)
        let newHistory = [...history];
        if (answer !== 'INIT' && currentQuestion) {
            newHistory.push({
                questionId: currentQuestion.id,
                featureKey: currentQuestion.featureKey,
                answer: answer as any,
                timestamp: Date.now(),
                timeTaken
            });
            set({ history: newHistory, characterState: 'thinking' });
        }

        try {
            // 2. Call API
            // MEMORY: If INIT, retrieve forbiddenIds (last starting questions)
            let forbiddenIds: string[] = [];
            if (answer === 'INIT') {
                try {
                    const stored = localStorage.getItem('mindora_last_starts');
                    if (stored) forbiddenIds = JSON.parse(stored);
                } catch (e) { /* ignore */ }
            }

            const response = await fetch('/api/mindora/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory,
                    theme: get().theme,
                    forbiddenIds // Pass to backend
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }

            const data = await response.json();

            // 3. Handle Decision
            // 3. Handle Decision
            if (data.action === 'ask') {
                // COGNITIVE HARMONY: Adaptive Pacing
                // Formula: base (400) + (entropy * 200) + (candidateCount * 2) - capped at 1000
                // We need candidate count from data. If not present, estimate from turnCount.
                // Assuming data.stats might exist or we use proxies.
                // Proxy: entropy (from new question), turnCount (inverse to candidates).
                const entropy = data.question.entropy_score || 0.5;
                const estimatedCandidates = Math.max(1, 100 - (get().turnCount * 10)); // Rough proxy

                const pauseMs = Math.min(900, 400 + (entropy * 200) + (estimatedCandidates * 2));

                // COGNITIVE HARMONY: Confidence Smoothing
                // smoothed = (current * 0.6) + (prev * 0.3) + (prev2 * 0.1)
                const rawConf = data.confidence || get().confidence;
                const log = get().confidenceLog;
                const prev = log.length > 0 ? log[log.length - 1] : rawConf;
                const prev2 = log.length > 1 ? log[log.length - 2] : prev;

                const smoothedConf = (rawConf * 0.6) + (prev * 0.3) + (prev2 * 0.1);

                // Wait for the adaptive pause
                setTimeout(() => {
                    set({
                        currentQuestion: data.question,
                        turnCount: get().turnCount + 1,
                        characterState: 'idle',
                        isLoading: false,
                        errorMessage: null
                    });
                    // Update confidence separately to ensure log is updated via action if needed, 
                    // or just set here. The store has updateConfidence action but we can set directly.
                    get().updateConfidence(smoothedConf);
                }, pauseMs);

            } else if (data.action === 'guess') {
                // Guess specific delay (suspense)
                const delay = 600 + Math.random() * 400; // Longer for big reveal

                setTimeout(() => {
                    set({
                        gameState: 'guessing',
                        guessResult: data.candidate,
                        confidence: data.confidence, // Smoothing less important for final guess, show raw? Or smooth?
                        // Let's show raw for the "Boom" moment or smooth for consistency.
                        // User says "Smooths confidence fluctuations".
                        // But final guess should probably reflect the high certainty.
                        characterState: 'thinking',
                        isLoading: false,
                        errorMessage: null
                    });
                    // Update confidence
                    get().updateConfidence(data.confidence);
                }, delay);
            }
        } catch (error: any) {
            console.warn("API Connection Unstable:", error);

            // AUTOMATIC RECOVERY (Simulated Retry via Timeout if first fail)
            // For now, let's just Fail Gracefully to "Confused" state.

            set({
                characterState: 'confused', // HUMAN RESPONSE
                isLoading: false,
                errorMessage: null, // "My mind wandered... please tell me a bit more." (Handled in UI)
            });
        }
    },

    confirmGuess: async (isCorrect: boolean) => {
        const { guessResult, history, turnCount, confidence, theme, region } = get();

        // Optimistic UI Update first
        if (isCorrect) {
            set({ gameState: 'victory', characterState: 'celebrating' });
        } else {
            set({ gameState: 'defeat', characterState: 'sad' });
        }

        // Analytics Telemetry
        AnalyticsUtils.logSession({
            id: `sess_${Date.now()}`,
            timestamp: Date.now(),
            theme: theme || 'General',
            region: region || 'Unknown',
            final_confidence: confidence,
            turns: turnCount,
            success: isCorrect,
            avg_decision_time: 0 // Would need detailed tracking, placeholder for now
        });

        try {
            await fetch('/api/mindora/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: 'mock_session', // In real app use ID
                    entityId: guessResult?.id,
                    confirmed: isCorrect,
                    history
                })
            });
        } catch (e) {
            console.error("Failed to confirm guess", e);
        }
    },

    resetGame: async () => {
        // MEMORY: Save current starting question to localStorage before wipe
        const { history } = get();
        if (history.length > 0) {
            const firstQ = history[0].questionId;
            try {
                const stored = localStorage.getItem('mindora_last_starts');
                const lastStarts: string[] = stored ? JSON.parse(stored) : [];

                // Add new start, keep only last 3
                if (!lastStarts.includes(firstQ)) {
                    lastStarts.push(firstQ);
                    if (lastStarts.length > 3) lastStarts.shift();
                    localStorage.setItem('mindora_last_starts', JSON.stringify(lastStarts));
                }
            } catch (e) {
                console.warn("Memory Save Failed", e);
            }
        }

        set({
            gameState: 'playing',
            confidence: 0,
            turnCount: 0,
            history: [],
            undoStack: [],
            characterState: 'thinking',
            currentQuestion: null,
            guessResult: null,
            errorMessage: null,
            isLoading: true
        });

        // Bootstrap: Fetch first question immediately
        await get().submitAnswer('INIT', 0);
    },
}));
