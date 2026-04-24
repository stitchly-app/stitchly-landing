-- Update the videos bucket to allow image MIME types for thumbnails
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'videos';