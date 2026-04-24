-- Drop the incorrect visitor delete policy
DROP POLICY IF EXISTS "Visitors can delete their own projects" ON public.projects;

-- Add correct delete policy for visitors that matches the pattern used in update policy
CREATE POLICY "Visitors can delete their own projects"
ON public.projects
FOR DELETE
USING (
  is_visitor = true 
  AND visitor_id IS NOT NULL
);