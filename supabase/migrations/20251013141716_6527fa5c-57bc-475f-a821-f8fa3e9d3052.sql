-- Create system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_limit_gb integer NOT NULL DEFAULT 10,
  watermark_text text NOT NULL DEFAULT 'SAMPLE',
  brand_name text NOT NULL DEFAULT 'Video Editor',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view system settings"
ON public.system_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.system_settings (storage_limit_gb, watermark_text, brand_name)
VALUES (10, 'SAMPLE', 'Video Editor')
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();