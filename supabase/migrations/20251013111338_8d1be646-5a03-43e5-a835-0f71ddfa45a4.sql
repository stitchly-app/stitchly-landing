-- Make user_id nullable in videos table for visitor support
ALTER TABLE public.videos 
ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in projects table for visitor support
ALTER TABLE public.projects 
ALTER COLUMN user_id DROP NOT NULL;