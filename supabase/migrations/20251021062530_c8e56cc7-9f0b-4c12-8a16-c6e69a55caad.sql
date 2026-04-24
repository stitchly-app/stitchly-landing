-- Drop the existing function first
DROP FUNCTION IF EXISTS public.delete_old_visitor_content();

-- Recreate the function with storage cleanup
CREATE OR REPLACE FUNCTION public.delete_old_visitor_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $function$
BEGIN
  -- First, delete storage files for old visitor videos
  -- Extract the path after 'videos/' from the file_url and delete from storage
  DELETE FROM storage.objects
  WHERE bucket_id = 'videos'
  AND name IN (
    SELECT SUBSTRING(file_url FROM 'videos/(.+)$')
    FROM public.videos
    WHERE is_visitor = true
    AND created_at < NOW() - INTERVAL '24 hours'
    AND file_url IS NOT NULL
  );
  
  -- Then delete old visitor projects
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
$function$;