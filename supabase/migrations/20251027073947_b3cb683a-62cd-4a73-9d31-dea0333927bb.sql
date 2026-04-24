-- Fix handle_new_user to use correct JSONB operators
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
    COALESCE(
      NULLIF(TRIM(CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name')), ''),
      'User'
    ),
    NEW.email
  );
  
  -- No longer creating user_roles row here
  RETURN NEW;
END;
$$;