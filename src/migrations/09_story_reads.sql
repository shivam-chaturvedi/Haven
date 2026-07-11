-- 09_story_reads.sql
-- Track unique readers per story and expose counts in story stats.

CREATE TABLE IF NOT EXISTS public.story_reads (
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (story_id, user_id)
);

ALTER TABLE public.story_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story reads are viewable by everyone."
    ON public.story_reads FOR SELECT USING (true);

CREATE POLICY "Authenticated users can record story reads."
    ON public.story_reads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Refresh stats view with reader counts
CREATE OR REPLACE VIEW public.stories_with_stats AS
SELECT
  s.id,
  s.title,
  s.text,
  s.image_url,
  s.location,
  s.is_anonymous,
  s.allow_comments,
  s.is_sensitive,
  s.scheduled_for,
  s.created_at,
  s.author_id,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  p.location as author_location,
  (SELECT COUNT(*) FROM public.story_likes sl WHERE sl.story_id = s.id) as like_count,
  (SELECT COUNT(*) FROM public.comments c WHERE c.story_id = s.id) as comment_count,
  (SELECT COUNT(*) FROM public.story_reads sr WHERE sr.story_id = s.id) as reader_count
FROM public.stories s
LEFT JOIN public.profiles p ON p.id = s.author_id;

GRANT SELECT ON public.stories_with_stats TO authenticated, anon;
