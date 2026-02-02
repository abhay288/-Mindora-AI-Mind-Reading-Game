
/**
 * Mathematical Utilities for Mindora Engine
 */

export class MathUtils {

    // Cosine Similarity: -1 to 1
    static cosineSimilarity(vecA?: number[], vecB?: number[]): number {
        if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }

        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);

        if (magA === 0 || magB === 0) return 0;

        return dotProduct / (magA * magB);
    }

    // Mock Embedding Generator (Deterministic for testing)
    static mockEmbedding(text: string): number[] {
        // Create a fake 10-dim vector based on char codes
        const vec = new Array(10).fill(0);
        for (let i = 0; i < text.length; i++) {
            vec[i % 10] += text.charCodeAt(i);
        }
        // Normalize
        const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
        return vec.map(v => v / (mag || 1));
    }
}
