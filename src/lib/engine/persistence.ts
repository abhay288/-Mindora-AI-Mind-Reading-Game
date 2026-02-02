import fs from 'fs';
import path from 'path';
import { Entity, Category, Question } from './types';
import { GamePattern } from './cores/patternEngine';

const DB_PATH = path.join(process.cwd(), 'data', 'mindora_db.json');

export interface DatabaseSchema {
    entities: Entity[];
    questions?: Question[]; // Added for consistency
    categories: Category[];
    patterns: GamePattern[];
    question_usage?: Record<string, { last_asked: number, count: number }>; // QuestionID -> Usage
}

export class Persistence {
    static getDBPath() {
        return DB_PATH;
    }

    static load(): DatabaseSchema {
        try {
            if (!fs.existsSync(DB_PATH)) {
                return { entities: [], categories: [], patterns: [] };
            }
            const raw = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(raw);
        } catch (error) {
            console.error("DB Load Error:", error);
            return { entities: [], categories: [], patterns: [] };
        }
    }

    static save(data: DatabaseSchema) {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
            // console.log("DB Saved to", DB_PATH);
        } catch (error) {
            console.error("DB Save Error:", error);
        }
    }

    // Generic JSON I/O for Analytics & Config
    static loadFile<T>(filename: string, defaultData: T): T {
        try {
            const filePath = path.join(process.cwd(), 'data', filename);
            if (!fs.existsSync(filePath)) return defaultData;
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            return defaultData;
        }
    }

    static saveFile<T>(filename: string, data: T): void {
        try {
            const filePath = path.join(process.cwd(), 'data', filename);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error(`Failed to save ${filename}`, e);
        }
    }
}
