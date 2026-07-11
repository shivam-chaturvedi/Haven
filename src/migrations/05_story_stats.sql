-- 05_story_stats.sql

-- Create an RPC to safely delete user's own account data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deleting from profiles will cascade to stories, comments, likes, bookmarks, etc.
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- Note: We cannot delete from auth.users easily without elevated privileges, 
  -- but clearing the public data handles the app's requirement.
END;
$$;

-- Create a view for fetching stories with aggregation
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
  (SELECT COUNT(*) FROM public.comments c WHERE c.story_id = s.id) as comment_count
FROM public.stories s
LEFT JOIN public.profiles p ON p.id = s.author_id;

-- Grant access to the view
GRANT SELECT ON public.stories_with_stats TO authenticated, anon;
