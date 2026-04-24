-- Enable RLS on demo template tables
ALTER TABLE public.demo_videos_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_projects_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_exports_template ENABLE ROW LEVEL SECURITY;

-- Only admins can manage demo templates
CREATE POLICY "Admins can manage demo video templates" 
ON public.demo_videos_template 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage demo project templates" 
ON public.demo_projects_template 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage demo export templates" 
ON public.demo_exports_template 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));