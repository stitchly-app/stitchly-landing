-- Add thumbnail_url column to videos table
ALTER TABLE public.videos
ADD COLUMN thumbnail_url text;

-- Add thumbnail_url column to demo_videos_template table
ALTER TABLE public.demo_videos_template
ADD COLUMN thumbnail_url text;
