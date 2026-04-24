-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Add logo_url column to system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage policy for logo uploads (admin only)
CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');