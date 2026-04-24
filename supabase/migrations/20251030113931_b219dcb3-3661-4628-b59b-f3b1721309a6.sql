-- Create function to reset entire database to demo state for admin
CREATE OR REPLACE FUNCTION public.reset_demo_admin_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _demo_user_id uuid := '850587bd-a428-41df-ae3f-1e51ff7c0c16'; -- test@mail.com user ID
  _video_mapping jsonb := '{}'::jsonb;
  _project_mapping jsonb := '{}'::jsonb;
  _template_video record;
  _template_project record;
  _template_export record;
  _new_video_id uuid;
  _new_project_id uuid;
BEGIN
  -- Delete ALL data from all tables (not user-specific)
  DELETE FROM public.audit_log;
  DELETE FROM public.exports;
  DELETE FROM public.projects;
  DELETE FROM public.videos;
  
  -- Copy videos from template with demo user ID
  FOR _template_video IN SELECT * FROM public.demo_videos_template LOOP
    INSERT INTO public.videos (
      user_id, original_name, file_url, duration, resolution, 
      aspect_ratio, size, thumbnail_url, is_visitor, created_at
    )
    VALUES (
      _demo_user_id,
      _template_video.original_name, _template_video.file_url,
      _template_video.duration, _template_video.resolution, _template_video.aspect_ratio,
      _template_video.size, _template_video.thumbnail_url, false, _template_video.created_at
    )
    RETURNING id INTO _new_video_id;
    
    _video_mapping := _video_mapping || jsonb_build_object(_template_video.id::text, _new_video_id::text);
  END LOOP;
  
  -- Copy projects from template with demo user ID
  FOR _template_project IN SELECT * FROM public.demo_projects_template LOOP
    INSERT INTO public.projects (
      user_id, name, 
      video_id, edits_json, format_settings_json, 
      is_visitor, created_at
    )
    VALUES (
      _demo_user_id,
      _template_project.name, 
      (_video_mapping->>_template_project.video_template_id::text)::uuid,
      _template_project.edits_json, _template_project.format_settings_json,
      false, _template_project.created_at
    )
    RETURNING id INTO _new_project_id;
    
    _project_mapping := _project_mapping || jsonb_build_object(_template_project.id::text, _new_project_id::text);
  END LOOP;
  
  -- Copy exports and create audit log entries
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
    
    -- Create audit log entry with demo user ID
    INSERT INTO public.audit_log (
      actor_id, entity, action, payload_json, created_at
    )
    VALUES (
      _demo_user_id,
      'export',
      'exported',
      jsonb_build_object(
        'entity_id', (_project_mapping->>_template_export.project_template_id::text)::uuid,
        'format', _template_export.format,
        'timestamp', _template_export.created_at
      ),
      _template_export.created_at
    );
  END LOOP;
END;
$function$;