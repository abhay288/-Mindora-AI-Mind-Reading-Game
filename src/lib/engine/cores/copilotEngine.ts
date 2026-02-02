import { Entity, Question, UserAnswer, BehavioralProfile } from "../types";
import OpenAI from 'openai';

/**
 * 9. COPILOT INTELLIGENCE LAYER (via OpenRouter)
 * Purpose: Provide creative, non-deterministic assistance when the core engine is stuck.
 */
export class CopilotEngine {
    private static openaiInstance: OpenAI | null = null;

    private static getOpenAI(): OpenAI | null {
        if (this.openaiInstance) return this.openaiInstance;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return null;

        this.openaiInstance = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            dangerouslyAllowBrowser: true,
            defaultHeaders: {
                "HTTP-Referer": "https://mindora.ai",
                "X-Title": "Mindora"
            }
        });
        return this.openaiInstance;
    }

    /**
     * Trigger: Low Entropy or Stagnant Confidence.
     * Task: Generate 2 YES/NO questions that separate remaining candidates.
     */
    static async generateDynamicQuestions(
        candidates: Entity[],
        history: UserAnswer[],
        behavior: BehavioralProfile,
        theme: string
    ): Promise<Question[]> {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("COPILOT: No API Key found, skipping generation.");
            return [];
        }

        console.log("COPILOT: Generating dynamic questions via OpenRouter...");

        try {
            const candidateNames = candidates.map(c => c.name).join(", ");
            const prompt = `
                Context: A guessing game (20 Questions style).
                Theme: ${theme}
                Remaining Candidates: ${candidateNames}
                
                Task: Generate 2 strategic YES/NO questions that effectively separate these candidates.
                Output JSON Format: { "questions": [ { "text": "Question?", "featureKey": "camelCaseKey" } ] }
            `;

            const client = this.getOpenAI();
            if (!client) return [];

            const completion = await client.chat.completions.create({
                messages: [{ role: "system", content: "You are a logical game engine. Output ONLY valid JSON." }, { role: "user", content: prompt }],
                model: "deepseek/deepseek-r1", // DeepSeek R1 via OpenRouter
                response_format: { type: "json_object" },
                temperature: 0.6,
            });

            let content = completion.choices[0].message.content || "{}";

            // Clean DeepSeek <think> tags if present
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            // Remove markdown code blocks if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            const result = JSON.parse(content);
            const questions = result.questions || result;

            if (Array.isArray(questions)) {
                return questions.map((q: any, index: number) => ({
                    id: `ai_gen_${Date.now()}_${index}`,
                    text: { en: q.text, hi: q.text },
                    featureKey: q.featureKey || `ai_feature_${index}`,
                    tags: ['generated', 'ai'],
                    quality_score: 0.85,
                    entropy_score: 0.9
                }));
            }
            return [];
        } catch (error) {
            console.error("COPILOT ERROR:", error);
            return [];
        }
    }

    /**
     * Trigger: Confidence 0.65 - 0.80 (Unsure but close).
     * Task:Suggest a likely entity based on semantic intuition.
     */
    static async assistGuess(
        history: UserAnswer[],
        candidates: Entity[],
        theme: string
    ): Promise<{ entityId: string | null, confidence: number }> {
        if (!process.env.OPENAI_API_KEY) return { entityId: null, confidence: 0 };

        try {
            const historyText = history.map(h => `Q: ${h.questionId} A: ${h.answer}`).join("\n");
            const candidateNames = candidates.map(c => c.name).join(", ");

            const prompt = `
                History:
                ${historyText}

                Candidates: ${candidateNames}

                Task: Based on the history, which candidate is the most likely match?
                Return JSON: { "candidateName": "Name", "confidence": 0.0-1.0 }
            `;

            const client = this.getOpenAI();
            if (!client) return { entityId: null, confidence: 0 };

            const completion = await client.chat.completions.create({
                messages: [{ role: "system", content: "You are an inference engine. Output ONLY valid JSON." }, { role: "user", content: prompt }],
                model: "deepseek/deepseek-r1",
                response_format: { type: "json_object" },
                temperature: 0.5,
            });

            let content = completion.choices[0].message.content || "{}";
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json/g, '').replace(/```/g, '').trim();

            const parsed = JSON.parse(content);

            if (parsed.candidateName) {
                const match = candidates.find(c => c.name.toLowerCase() === parsed.candidateName.toLowerCase());
                if (match) {
                    return { entityId: match.id, confidence: parsed.confidence * 0.8 };
                }
            }
            return { entityId: null, confidence: 0 };

        } catch (error) {
            console.error("COPILOT GUESS ERROR:", error);
            return { entityId: null, confidence: 0 };
        }
    }

    /**
     * Trigger: After Wrong Guess (Learning Phase).
     * Task: Generate distinctions between Guessed (Wrong) and Actual (Right).
     */
    static async differentiate(
        wrongEntity: Entity,
        correctEntityName: string,
        theme: string
    ): Promise<Question[]> {
        if (!process.env.OPENAI_API_KEY) return [];

        try {
            const prompt = `
                Entity A (Wrong Guess): ${wrongEntity.name} (${wrongEntity.description})
                Entity B (Correct Answer): ${correctEntityName}
                
                Task: Generate 1 decisive YES/NO question that is TRUE for ${correctEntityName} and FALSE for ${wrongEntity.name}.
                Output JSON: { "text": "Question?", "featureKey": "key" }
            `;

            const client = this.getOpenAI();
            if (!client) return [];

            const completion = await client.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "deepseek/deepseek-r1",
                response_format: { type: "json_object" },
            });

            let content = completion.choices[0].message.content || "{}";
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json/g, '').replace(/```/g, '').trim();

            const q = JSON.parse(content);

            if (q.text) {
                return [{
                    id: `diff_${Date.now()}`,
                    text: { en: q.text, hi: q.text },
                    featureKey: q.featureKey || 'distinguisher',
                    tags: ['learning', 'comparison'],
                    quality_score: 0.95
                }];
            }
            return [];

        } catch (error) {
            return [];
        }
    }
}
