-- Add visitor tracking columns to videos table
ALTER TABLE public.videos
ADD COLUMN visitor_id TEXT,
ADD COLUMN is_visitor BOOLEAN DEFAULT false;

-- Add visitor tracking columns to projects table
ALTER TABLE public.projects
ADD COLUMN visitor_id TEXT,
ADD COLUMN is_visitor BOOLEAN DEFAULT false;

-- Add visitor tracking columns to exports table
ALTER TABLE public.exports
ADD COLUMN visitor_id TEXT,
ADD COLUMN is_visitor BOOLEAN DEFAULT false;

-- Update RLS policies for videos to allow visitor uploads
CREATE POLICY "Visitors can create videos"
ON public.videos
FOR INSERT
WITH CHECK (is_visitor = true AND visitor_id IS NOT NULL);

CREATE POLICY "Visitors can view their own videos"
ON public.videos
FOR SELECT
USING (is_visitor = true AND visitor_id IS NOT NULL);

-- Update RLS policies for projects to allow visitor projects
CREATE POLICY "Visitors can create projects"
ON public.projects
FOR INSERT
WITH CHECK (is_visitor = true AND visitor_id IS NOT NULL);

CREATE POLICY "Visitors can view their own projects"
ON public.projects
FOR SELECT
USING (is_visitor = true AND visitor_id IS NOT NULL);

CREATE POLICY "Visitors can update their own projects"
ON public.projects
FOR UPDATE
USING (is_visitor = true AND visitor_id IS NOT NULL);

-- Update RLS policies for exports to allow visitor exports
CREATE POLICY "Visitors can create exports"
ON public.exports
FOR INSERT
WITH CHECK (is_visitor = true AND visitor_id IS NOT NULL);

CREATE POLICY "Visitors can view their own exports"
ON public.exports
FOR SELECT
USING (is_visitor = true AND visitor_id IS NOT NULL);

-- Update the cleanup function to delete based on is_visitor flag
CREATE OR REPLACE FUNCTION public.delete_old_visitor_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old visitor projects
  DELETE FROM public.projects
  WHERE is_visitor = true
  AND created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete old visitor videos (orphaned ones without projects)
  DELETE FROM public.videos
  WHERE is_visitor = true
  AND created_at < NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.video_id = videos.id
  );
  
  -- Delete old visitor exports
  DELETE FROM public.exports
  WHERE is_visitor = true
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;