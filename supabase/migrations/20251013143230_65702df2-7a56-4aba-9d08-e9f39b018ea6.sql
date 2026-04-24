-- Create demo data template tables
CREATE TABLE IF NOT EXISTS public.demo_videos_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name text NOT NULL,
  file_url text NOT NULL,
  duration numeric,
  resolution text,
  aspect_ratio text,
  size bigint,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_projects_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  video_template_id uuid REFERENCES public.demo_videos_template(id) ON DELETE CASCADE,
  edits_json jsonb DEFAULT '[]'::jsonb,
  format_settings_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_exports_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_template_id uuid REFERENCES public.demo_projects_template(id) ON DELETE CASCADE,
  video_template_id uuid REFERENCES public.demo_videos_template(id) ON DELETE CASCADE,
  status export_status DEFAULT 'pending',
  format text DEFAULT 'mp4',
  aspect_ratio text,
  resolution text,
  output_urls jsonb DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create function to reset demo data for a user
CREATE OR REPLACE FUNCTION public.reset_demo_data(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _video_mapping jsonb := '{}'::jsonb;
  _project_mapping jsonb := '{}'::jsonb;
  _template_video record;
  _template_project record;
  _template_export record;
  _new_video_id uuid;
  _new_project_id uuid;
BEGIN
  -- Delete existing user data
  DELETE FROM public.exports WHERE EXISTS (
    SELECT 1 FROM public.projects WHERE projects.id = exports.project_id AND projects.user_id = _user_id
  );
  DELETE FROM public.projects WHERE user_id = _user_id;
  DELETE FROM public.videos WHERE user_id = _user_id;
  
  -- Copy videos from template
  FOR _template_video IN SELECT * FROM public.demo_videos_template LOOP
    INSERT INTO public.videos (
      user_id, original_name, file_url, duration, resolution, 
      aspect_ratio, size, is_visitor, created_at
    )
    VALUES (
      _user_id, _template_video.original_name, _template_video.file_url,
      _template_video.duration, _template_video.resolution, _template_video.aspect_ratio,
      _template_video.size, false, _template_video.created_at
    )
    RETURNING id INTO _new_video_id;
    
    _video_mapping := _video_mapping || jsonb_build_object(_template_video.id::text, _new_video_id::text);
  END LOOP;
  
  -- Copy projects from template
  FOR _template_project IN SELECT * FROM public.demo_projects_template LOOP
    INSERT INTO public.projects (
      user_id, name, video_id, edits_json, format_settings_json, 
      is_visitor, created_at
    )
    VALUES (
      _user_id, _template_project.name, 
      (_video_mapping->>_template_project.video_template_id::text)::uuid,
      _template_project.edits_json, _template_project.format_settings_json,
      false, _template_project.created_at
    )
    RETURNING id INTO _new_project_id;
    
    _project_mapping := _project_mapping || jsonb_build_object(_template_project.id::text, _new_project_id::text);
  END LOOP;
  
  -- Copy exports from template
  FOR _template_export IN SELECT * FROM public.demo_exports_template LOOP
    INSERT INTO public.exports (
      project_id, video_id, status, format, aspect_ratio, resolution,
      output_urls, completed_at, is_visitor, created_at
    )
    VALUES (
      (_project_mapping->>_template_export.project_template_id::text)::uuid,
      (_video_mapping->>_template_export.video_template_id::text)::uuid,
      _template_export.status, _template_export.format, _template_export.aspect_ratio,
      _template_export.resolution, _template_export.output_urls, _template_export.completed_at,
      false, _template_export.created_at
    );
  END LOOP;
END;
$$;