
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'mindora_db.json');
const DIR_PATH = path.join(process.cwd(), 'data');

// Simple UUID generator
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 1. Define Categories
const categories = [
    { id: 'cat_youtuber', name: 'YouTuber', icon: 'Youtube', search_tags: ['video', 'creator'] },
    { id: 'cat_bollywood', name: 'Bollywood Actor', icon: 'Film', search_tags: ['movie', 'star'] },
    { id: 'cat_singer', name: 'Singer', icon: 'Mic', search_tags: ['music', 'artist'] },
    { id: 'cat_cricket', name: 'Cricketer', icon: 'Activity', search_tags: ['sport', 'athlete'] },
    { id: 'cat_fictional', name: 'Fictional Character', icon: 'Book', search_tags: ['story', 'anime'] },
];

// Helper to get basic features by category
function getBaseFeatures(catId) {
    const f = {};
    if (catId === 'cat_youtuber') { f['is_person'] = 'Yes'; f['is_youtuber'] = 'Yes'; f['is_real'] = 'Yes'; }
    if (catId === 'cat_bollywood') { f['is_person'] = 'Yes'; f['is_actor'] = 'Yes'; f['is_real'] = 'Yes'; f['is_indian'] = 'Yes'; }
    if (catId === 'cat_singer') { f['is_person'] = 'Yes'; f['is_singer'] = 'Yes'; f['is_real'] = 'Yes'; }
    if (catId === 'cat_cricket') { f['is_person'] = 'Yes'; f['is_athlete'] = 'Yes'; f['is_real'] = 'Yes'; f['plays_cricket'] = 'Yes'; }
    if (catId === 'cat_fictional') { f['is_person'] = 'No'; f['is_real'] = 'No'; f['is_fictional'] = 'Yes'; }
    return f;
}

// 2. Define Entities
const rawEntities = [
    // YouTubers
    { name: "CarryMinati", cat: "cat_youtuber", desc: "Indian roaster" },
    { name: "MrBeast", cat: "cat_youtuber", desc: "Philanthropist" },
    { name: "PewDiePie", cat: "cat_youtuber", desc: "Gamer" },

    // Bollywood
    { name: "Shah Rukh Khan", cat: "cat_bollywood", desc: "King Khan" },
    { name: "Salman Khan", cat: "cat_bollywood", desc: "Bhai" },
    { name: "Deepika Padukone", cat: "cat_bollywood", desc: "Actress" },

    // Singers
    { name: "Arijit Singh", cat: "cat_singer", desc: "Playback singer" },
    { name: "Neha Kakkar", cat: "cat_singer", desc: "Party songs" },

    // Cricketers
    { name: "Virat Kohli", cat: "cat_cricket", desc: "King Kohli" },
    { name: "MS Dhoni", cat: "cat_cricket", desc: "Captain Cool" },

    // Fictional
    { name: "Harry Potter", cat: "cat_fictional", desc: "Wizard" },
    { name: "Iron Man", cat: "cat_fictional", desc: "Superhero" },
    { name: "Doraemon", cat: "cat_fictional", desc: "Robot Cat" }
];

const entities = rawEntities.map(raw => ({
    id: uuidv4(),
    name: raw.name,
    category_id: raw.cat,
    description: raw.desc,
    is_public_figure: true,
    created_at: Date.now(),
    popularity: 0.8,
    features: getBaseFeatures(raw.cat)
}));

// Ensure Dir Exists
if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH, { recursive: true });
}

// Save
fs.writeFileSync(DB_PATH, JSON.stringify({
    entities,
    categories,
    patterns: []
}, null, 2));

console.log(`✅ Seeded ${categories.length} Categories and ${entities.length} Entities.`);
