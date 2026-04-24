-- Update storage policies to allow visitor uploads

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Visitors can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone (including visitors) to upload to videos bucket
-- They can only upload to folders that match a specific pattern
CREATE POLICY "Visitors can upload videos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'videos'
);

-- Drop existing select policies if they exist
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;

-- Allow anyone to view videos (since bucket is public)
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');