-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 1. Entities (The characters)
create table entities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  popularity_score int default 0,
  is_verified boolean default false, -- separating core data from user-learned data
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Questions
create table questions (
  id uuid default uuid_generate_v4() primary key,
  text text not null unique,
  category text, -- e.g., 'physical', 'personality'
  usage_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Knowledge Base (The Brain)
-- Stores the probabilistic link between entities and questions.
-- value: -1.0 (Definitely No) to 1.0 (Definitely Yes). 0 is 'Don't Know'. 
-- We can map user answers: Yes (+1), Probably (+0.5), Don't Know (0), Probably Not (-0.5), No (-1)
-- Or use the -2 to +2 scale as requested: Yes (+2), No (-2).
-- Let's stick to the requested -2 to +2 for inputs, but normalize to -1 to 1 for the probability logic if needed.
-- Actually the prompt asked for "Weighted answers (-2 to +2)". We will store the *learned* weight here.
create table entity_questions (
  entity_id uuid references entities(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  value float check (value >= -2 and value <= 2), 
  primary key (entity_id, question_id)
);

-- 4. Game Sessions
create table game_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- nullable for guest play
  status text check (status in ('active', 'won', 'lost', 'abandoned')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Session Logs (For Learning)
create table session_answers (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references game_sessions(id) on delete cascade,
  question_id uuid references questions(id),
  answer_value float not null, -- The user's input (-2, -1, 0, 1, 2)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Basic Setup)
alter table entities enable row level security;
alter table questions enable row level security;
alter table entity_questions enable row level security;
alter table game_sessions enable row level security;
alter table session_answers enable row level security;

-- Public READ access
create policy "Public entities are viewable by everyone" on entities for select using (true);
create policy "Public questions are viewable by everyone" on questions for select using (true);
create policy "Public knowledge base is viewable by everyone" on entity_questions for select using (true);

-- Authenticated (or anon) INSERT access for sessions (needs refinement for logic, but ok for now)
create policy "Anyone can create a game session" on game_sessions for insert with check (true);
create policy "Anyone can insert answers" on session_answers for insert with check (true);
