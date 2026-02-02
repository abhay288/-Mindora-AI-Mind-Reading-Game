
import { MathUtils } from '../utils/mathUtils';
import OpenAI from 'openai';

export class EmbeddingService {
    private static openai: OpenAI | null = null;
    private static cache: Map<string, number[]> = new Map(); // Simple in-memory cache

    private static getOpenAI() {
        if (process.env.OPENAI_API_KEY && !this.openai) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                dangerouslyAllowBrowser: true
            });
        }
        return this.openai;
    }

    static async getEmbedding(text: string): Promise<number[]> {
        // 0. Check Cache
        if (this.cache.has(text)) {
            return this.cache.get(text)!;
        }

        // 1. Try OpenAI if available
        const client = this.getOpenAI();
        if (client) {
            try {
                const response = await client.embeddings.create({
                    model: "text-embedding-3-small",
                    input: text,
                    encoding_format: "float",
                });
                const vec = response.data[0].embedding;
                this.cache.set(text, vec); // Cache it
                return vec;
            } catch (e) {
                console.warn("Embedding API failed, falling back to mock:", e);
            }
        }

        // 2. Fallback to Deterministic Mock
        const mockVec = MathUtils.mockEmbedding(text);
        this.cache.set(text, mockVec);
        return mockVec;
    }
}
