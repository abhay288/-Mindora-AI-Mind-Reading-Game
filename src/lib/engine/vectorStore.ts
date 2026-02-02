
import fs from 'fs';
import path from 'path';
import { MathUtils } from '../utils/mathUtils';

interface VectorRecord {
    id: string;
    vector: number[];
    metadata?: any;
}

export class VectorStore {
    private static instance: VectorStore;
    private vectors: VectorRecord[] = [];
    private dbPath = path.join(process.cwd(), 'data', 'vectors.json');

    private constructor() {
        this.load();
    }

    static getInstance(): VectorStore {
        if (!VectorStore.instance) {
            VectorStore.instance = new VectorStore();
        }
        return VectorStore.instance;
    }

    private load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const raw = fs.readFileSync(this.dbPath, 'utf-8');
                this.vectors = JSON.parse(raw);
            }
        } catch (e) {
            console.error("VectorStore load error:", e);
            this.vectors = [];
        }
    }

    save() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.dbPath, JSON.stringify(this.vectors, null, 2));
        } catch (e) {
            console.error("VectorStore save error:", e);
        }
    }

    add(id: string, vector: number[], metadata?: any) {
        const existingIndex = this.vectors.findIndex(v => v.id === id);
        if (existingIndex >= 0) {
            this.vectors[existingIndex] = { id, vector, metadata };
        } else {
            this.vectors.push({ id, vector, metadata });
        }
        // Auto-save on add for simple persistence
        this.save();
    }

    async search(queryVector: number[], limit: number = 5): Promise<{ id: string, score: number, metadata?: any }[]> {
        if (!queryVector || queryVector.length === 0) return [];

        const results = this.vectors.map(record => {
            const score = MathUtils.cosineSimilarity(queryVector, record.vector);
            return {
                id: record.id,
                score,
                metadata: record.metadata
            };
        });

        // Sort descending by similarity score
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    get(id: string): VectorRecord | undefined {
        return this.vectors.find(v => v.id === id);
    }
}
