-- Enable RLS on all tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (Anyone can play)
CREATE POLICY "Public read entities" ON entities FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read answers" ON answers FOR SELECT USING (true);

-- 2. Session Management (Users can create their own sessions)
-- Ideally, we might want to restrict selection to own sessions, but for now:
CREATE POLICY "Insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Select own sessions" ON sessions FOR SELECT USING (true); 

-- 3. Game Answers (Users persist their answers)
CREATE POLICY "Insert game_answers" ON game_answers FOR INSERT WITH CHECK (true);

-- 4. Learning Logs (Insert Only)
CREATE POLICY "Insert learning logs" ON learning_logs FOR INSERT WITH CHECK (true);

-- 5. Protection Policies (Prevent Deletion/Modification by Anon)
-- RLS default is "Deny All" for operations not covered by policies.
-- So we generally don't need explicit "No delete" unless we have a permissive policy elsewhere.
-- But explicitly:
-- No DELETE policies are created for public, so deletion is blocked.
-- No UPDATE policies are created for public, so updates are blocked.

-- 6. Admin Update (Example: Requires a custom claim or role, or just authenticated admin)
-- Assuming 'admin' role or specific user check.
-- For now, left strictly read-only for public.
