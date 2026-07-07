-- 02_storage_buckets.sql
-- Description: Create storage buckets for images and set up access policies.

-- Create buckets for post images and comment images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('post_images', 'post_images', true),
  ('comment_images', 'comment_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies to allow all operations (true)
-- Post Images Policies
CREATE POLICY "Allow all select for post_images" ON storage.objects FOR SELECT USING (bucket_id = 'post_images');
CREATE POLICY "Allow all insert for post_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post_images');
CREATE POLICY "Allow all update for post_images" ON storage.objects FOR UPDATE USING (bucket_id = 'post_images');
CREATE POLICY "Allow all delete for post_images" ON storage.objects FOR DELETE USING (bucket_id = 'post_images');

-- Comment Images Policies
CREATE POLICY "Allow all select for comment_images" ON storage.objects FOR SELECT USING (bucket_id = 'comment_images');
CREATE POLICY "Allow all insert for comment_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comment_images');
CREATE POLICY "Allow all update for comment_images" ON storage.objects FOR UPDATE USING (bucket_id = 'comment_images');
CREATE POLICY "Allow all delete for comment_images" ON storage.objects FOR DELETE USING (bucket_id = 'comment_images');
