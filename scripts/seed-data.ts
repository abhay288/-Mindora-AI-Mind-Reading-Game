
import { Persistence } from "../src/lib/engine/persistence";
import { Category, Entity } from "../src/lib/engine/types";
import crypto from 'crypto';

console.log("🌱 Seeding Mindora Database (Method A - Smart Growth)...");

// 1. Define Categories
const categories: Category[] = [
    { id: 'cat_youtuber', name: 'YouTuber', icon: 'Youtube', search_tags: ['video', 'creator', 'vlog', 'streamer'] },
    { id: 'cat_bollywood', name: 'Bollywood Actor', icon: 'Film', search_tags: ['movie', 'cinema', 'star', 'actor'] },
    { id: 'cat_singer', name: 'Singer', icon: 'Mic', search_tags: ['music', 'song', 'artist', 'musician'] },
    { id: 'cat_cricket', name: 'Cricketer', icon: 'Activity', search_tags: ['sport', 'bat', 'ball', 'athlete'] },
    { id: 'cat_fictional', name: 'Fictional Character', icon: 'Book', search_tags: ['story', 'comic', 'anime', 'movie'] },
    { id: 'cat_politician', name: 'Politician', icon: 'Landmark', search_tags: ['leader', 'vote', 'government'] },
    { id: 'cat_tech', name: 'Tech Leader', icon: 'Cpu', search_tags: ['startup', 'business', 'ceo'] },
];

// 2. Define Entities (Top 100-ish subset for brevity, expandable)
const rawEntities = [
    // YouTubers
    { name: "CarryMinati", cat: "cat_youtuber", desc: "Indian roaster and gamer." },
    { name: "MrBeast", cat: "cat_youtuber", desc: "American philanthropist and challenge creator." },
    { name: "PewDiePie", cat: "cat_youtuber", desc: "Swedish gamer and commentary channel." },
    { name: "Tech Burner", cat: "cat_youtuber", desc: "Indian tech reviewer with humor." },
    { name: "BB Ki Vines", cat: "cat_youtuber", desc: "Indian comedian playing multiple characters." },
    { name: "Ashish Chanchlani", cat: "cat_youtuber", desc: "Indian comedy sketch creator." },
    { name: "Total Gaming", cat: "cat_youtuber", desc: "Indian gaming channel (Ajju Bhai)." },
    { name: "Triggered Insaan", cat: "cat_youtuber", desc: "Indian roaster and content creator." },
    { name: "Flying Beast", cat: "cat_youtuber", desc: "Pilot vlogger and fitness enthusiast." },
    { name: "Sandeep Maheshwari", cat: "cat_youtuber", desc: "Motivational speaker." },

    // Bollywood
    { name: "Shah Rukh Khan", cat: "cat_bollywood", desc: "The King of Bollywood." },
    { name: "Salman Khan", cat: "cat_bollywood", desc: "Bhai of Bollywood." },
    { name: "Aamir Khan", cat: "cat_bollywood", desc: "Mr. Perfectionist." },
    { name: "Ranveer Singh", cat: "cat_bollywood", desc: "Energetic actor known for versatility." },
    { name: "Deepika Padukone", cat: "cat_bollywood", desc: "Leading actress and producer." },
    { name: "Alia Bhatt", cat: "cat_bollywood", desc: "Talented young actress." },
    { name: "Amitabh Bachchan", cat: "cat_bollywood", desc: "The Shahenshah of Bollywood." },
    { name: "Akshay Kumar", cat: "cat_bollywood", desc: "Action star and Khiladi." },
    { name: "Ranbir Kapoor", cat: "cat_bollywood", desc: "Actor from the Kapoor dynasty." },
    { name: "Hrithik Roshan", cat: "cat_bollywood", desc: "Greek God of Bollywood." },

    // Singers
    { name: "Arijit Singh", cat: "cat_singer", desc: "Soulful playback singer." },
    { name: "Neha Kakkar", cat: "cat_singer", desc: "Popular party song singer." },
    { name: "Shreya Ghoshal", cat: "cat_singer", desc: "Melodious playback singer." },
    { name: "Sonu Nigam", cat: "cat_singer", desc: "Legendary versatile singer." },
    { name: "Diljit Dosanjh", cat: "cat_singer", desc: "Punjabi singer and actor (G.O.A.T)." },
    { name: "A.R. Rahman", cat: "cat_singer", desc: "Oscar-winning composer and singer." },
    { name: "Badshah", cat: "cat_singer", desc: "Rapper and music producer." },
    { name: "Honey Singh", cat: "cat_singer", desc: "Yo Yo Honey Singh, rapper." },
    { name: "Lata Mangeshkar", cat: "cat_singer", desc: "Nightingale of India." },
    { name: "Kishore Kumar", cat: "cat_singer", desc: "Legendary singer and actor." },

    // Cricketers
    { name: "Virat Kohli", cat: "cat_cricket", desc: "King Kohli, former captain." },
    { name: "MS Dhoni", cat: "cat_cricket", desc: "Captain Cool." },
    { name: "Sachin Tendulkar", cat: "cat_cricket", desc: "God of Cricket." },
    { name: "Rohit Sharma", cat: "cat_cricket", desc: "Hitman, current captain." },
    { name: "Hardik Pandya", cat: "cat_cricket", desc: "All-rounder style icon." },

    // Tech
    { name: "Elon Musk", cat: "cat_tech", desc: "CEO of Tesla, SpaceX, X." },
    { name: "Mark Zuckerberg", cat: "cat_tech", desc: "Founder of Facebook/Meta." },
    { name: "Sundar Pichai", cat: "cat_tech", desc: "CEO of Google." },
    { name: "Steve Jobs", cat: "cat_tech", desc: "Co-founder of Apple." },
    { name: "Bill Gates", cat: "cat_tech", desc: "Co-founder of Microsoft." },

    // Fictional
    { name: "Harry Potter", cat: "cat_fictional", desc: "The Boy Who Lived." },
    { name: "Iron Man", cat: "cat_fictional", desc: "Tony Stark, Marvel superhero." },
    { name: "Spider-Man", cat: "cat_fictional", desc: "Peter Parker, web slinger." },
    { name: "Batman", cat: "cat_fictional", desc: "The Dark Knight." },
    { name: "Doraemon", cat: "cat_fictional", desc: "Robot cat from future." },
    { name: "Goku", cat: "cat_fictional", desc: "Saiyan warrior from Dragon Ball." },
    { name: "Naruto Uzumaki", cat: "cat_fictional", desc: "Ninja aspiring to be Hokage." },
];

const entities: Entity[] = rawEntities.map(raw => ({
    id: crypto.randomUUID(),
    name: raw.name,
    category_id: raw.cat,
    description: raw.desc,
    is_public_figure: true,
    created_at: Date.now(),
    popularity: 0.8, // Start high for seeded data
    features: {} // To be filled dynamically by AI later or defaults
}));

// Save to DB
Persistence.save({
    entities,
    categories,
    patterns: []
});

console.log(`✅ Seeded ${categories.length} Categories and ${entities.length} Entities.`);
