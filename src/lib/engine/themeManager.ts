
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface ThemeConfig {
    name: string;
    primaryColor: string; // Tailwind class partial or hex
    accentColor: string;
    ambientSound?: string;
    mood: string;
}

export class ThemeManager {
    static getSeason(): Season {
        const month = new Date().getMonth() + 1; // 1-12
        if (month >= 3 && month <= 5) return 'Spring';
        if (month >= 6 && month <= 8) return 'Summer';
        if (month >= 9 && month <= 11) return 'Autumn';
        return 'Winter';
    }

    static getSeasonalTheme(): ThemeConfig {
        const season = this.getSeason();

        switch (season) {
            case 'Winter':
                return {
                    name: 'Winter Frost',
                    primaryColor: 'cyan-400',
                    accentColor: 'blue-500',
                    mood: 'Crisp & Analytical'
                };
            case 'Spring':
                return {
                    name: 'Spring Bloom',
                    primaryColor: 'emerald-400',
                    accentColor: 'teal-500',
                    mood: 'Fresh & Growing'
                };
            case 'Summer':
                return {
                    name: 'Summer Heat',
                    primaryColor: 'orange-400',
                    accentColor: 'red-500',
                    mood: 'Vibrant & Fast'
                };
            case 'Autumn':
                return {
                    name: 'Autumn Gold',
                    primaryColor: 'amber-400',
                    accentColor: 'yellow-600',
                    mood: 'Deep & Reflective'
                };
        }
    }
}
