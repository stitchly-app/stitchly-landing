-- Add delete policy for visitors
CREATE POLICY "Visitors can delete their own projects"
ON public.projects
FOR DELETE
USING (
  is_visitor = true 
  AND visitor_id IS NOT NULL 
  AND visitor_id = (SELECT NULLIF(current_setting('request.headers', true)::json->>'x-visitor-id', ''))
);