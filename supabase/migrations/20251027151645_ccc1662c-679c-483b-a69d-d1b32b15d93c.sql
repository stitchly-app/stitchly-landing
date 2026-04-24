-- Function to delete video and storage files when project is deleted
CREATE OR REPLACE FUNCTION public.delete_project_video()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'storage'
AS $$
DECLARE
  v_file_url TEXT;
  v_thumbnail_url TEXT;
  v_file_path TEXT;
  v_thumbnail_path TEXT;
BEGIN
  -- Get the video URLs
  SELECT file_url, thumbnail_url INTO v_file_url, v_thumbnail_url
  FROM public.videos
  WHERE id = OLD.video_id;
  
  -- Extract file paths and delete from storage if they exist
  IF v_file_url IS NOT NULL THEN
    v_file_path := SUBSTRING(v_file_url FROM 'videos/(.+)$');
    IF v_file_path IS NOT NULL THEN
      DELETE FROM storage.objects
      WHERE bucket_id = 'videos' AND name = v_file_path;
    END IF;
  END IF;
  
  IF v_thumbnail_url IS NOT NULL THEN
    v_thumbnail_path := SUBSTRING(v_thumbnail_url FROM 'videos/(.+)$');
    IF v_thumbnail_path IS NOT NULL THEN
      DELETE FROM storage.objects
      WHERE bucket_id = 'videos' AND name = v_thumbnail_path;
    END IF;
  END IF;
  
  -- Delete the video record
  DELETE FROM public.videos WHERE id = OLD.video_id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for projects deletion
DROP TRIGGER IF EXISTS trigger_delete_project_video ON public.projects;
CREATE TRIGGER trigger_delete_project_video
AFTER DELETE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.delete_project_video();