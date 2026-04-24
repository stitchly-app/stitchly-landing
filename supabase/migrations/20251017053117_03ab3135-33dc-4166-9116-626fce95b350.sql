-- Insert default system settings if none exist
INSERT INTO public.system_settings (storage_limit_gb, watermark_text, brand_name)
SELECT 10, 'SAMPLE', 'Video Platform'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Allow everyone (including unauthenticated users) to read system settings
CREATE POLICY "Anyone can view system settings"
ON public.system_settings
FOR SELECT
USING (true);