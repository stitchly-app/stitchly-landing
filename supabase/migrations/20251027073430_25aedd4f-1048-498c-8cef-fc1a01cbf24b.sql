-- Update handle_new_user to NOT create default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile only
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email
  );
  
  -- No longer creating user_roles row here
  RETURN NEW;
END;
$$;

-- Add policy to allow users to set their initial role
CREATE POLICY "Users can set their initial role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    )
  );