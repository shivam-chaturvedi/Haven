-- 03_fun_activities.sql

CREATE TABLE public.fun_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    icon_name TEXT,
    icon_color TEXT,
    icon_bg_color TEXT,
    section TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fun_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fun activities are viewable by everyone." 
ON public.fun_activities FOR SELECT USING (true);

-- Admins can manage via Supabase dashboard (no explicit insert/update policies needed for service role / dashboard)

-- Insert the default ones to get started
INSERT INTO public.fun_activities (title, description, link, icon_name, icon_color, icon_bg_color, section)
VALUES 
('ABCmouse', 'Interactive games, books, and activities covering subjects like math, science, and art.', 'https://www.abcmouse.com/', 'Mouse', '#d97706', '#fef3c7', 'Trending Today'),
('Prodigy', 'A math-based RPG game where kids can practice math skills by solving problems and defeating in-game creatures.', 'https://www.prodigygame.com/', 'Dices', '#dc2626', '#fee2e2', 'Trending Today'),
('Geoknights', 'Nature, conservation, and the environment through interactive games. Become eco-warriors and protect our world''s natural treasures!', 'https://geoknights.com/', 'Leaf', '#16a34a', '#dcfce7', 'Top games this month'),
('Science Sleuths', 'Become a detective of the natural world with Science Sleuths.', 'https://sciencesleuths.org/', 'Microscope', '#0284c7', '#e0f2fe', 'Top games this month'),
('StoryCraft Kingdom', 'Create your own stories, characters, and worlds, all while developing writing skills and having a blast. The ultimate storytelling adventure!', 'https://storycraft.com/', 'BookOpen', '#7c3aed', '#ede9fe', 'Continue Playing');
