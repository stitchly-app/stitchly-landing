-- Update RLS policies for RBAC with Visitor, User, and Admin roles

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Visitors and Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users and Admins can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- VIDEOS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can view their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;

-- Visitors, Users can create their own videos
CREATE POLICY "Users can create own videos"
ON public.videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Visitors, Users can view their own videos
CREATE POLICY "Users can view own videos"
ON public.videos FOR SELECT
USING (auth.uid() = user_id);

-- Users (not visitors) can update their own videos
CREATE POLICY "Users can update own videos"
ON public.videos FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (public.has_role(auth.uid(), 'user') OR public.has_role(auth.uid(), 'admin'))
);

-- Users (not visitors) can delete their own videos
CREATE POLICY "Users can delete own videos"
ON public.videos FOR DELETE
USING (
  auth.uid() = user_id 
  AND (public.has_role(auth.uid(), 'user') OR public.has_role(auth.uid(), 'admin'))
);

-- Admins can view all videos
CREATE POLICY "Admins can view all videos"
ON public.videos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all videos
CREATE POLICY "Admins can update all videos"
ON public.videos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all videos
CREATE POLICY "Admins can delete all videos"
ON public.videos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PROJECTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Visitors, Users can create their own projects
CREATE POLICY "Users can create own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Visitors, Users can view their own projects
CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

-- Users (not visitors) can update their own projects
CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (public.has_role(auth.uid(), 'user') OR public.has_role(auth.uid(), 'admin'))
);

-- Users (not visitors) can delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
USING (
  auth.uid() = user_id 
  AND (public.has_role(auth.uid(), 'user') OR public.has_role(auth.uid(), 'admin'))
);

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all projects
CREATE POLICY "Admins can update all projects"
ON public.projects FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all projects
CREATE POLICY "Admins can delete all projects"
ON public.projects FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- EXPORTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create exports for their projects" ON public.exports;
DROP POLICY IF EXISTS "Users can view exports for their projects" ON public.exports;
DROP POLICY IF EXISTS "Users can update exports for their projects" ON public.exports;

-- All authenticated users can create exports for their projects
CREATE POLICY "Users can create exports for own projects"
ON public.exports FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = exports.project_id
    AND projects.user_id = auth.uid()
  )
);

-- All authenticated users can view exports for their projects
CREATE POLICY "Users can view exports for own projects"
ON public.exports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = exports.project_id
    AND projects.user_id = auth.uid()
  )
);

-- All authenticated users can update exports for their projects
CREATE POLICY "Users can update exports for own projects"
ON public.exports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = exports.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Admins can view all exports
CREATE POLICY "Admins can view all exports"
ON public.exports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all exports
CREATE POLICY "Admins can update all exports"
ON public.exports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete all exports
CREATE POLICY "Admins can delete all exports"
ON public.exports FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- AUTO-DELETE FUNCTION FOR VISITOR CONTENT
-- ============================================

-- Function to delete visitor content older than 24 hours
CREATE OR REPLACE FUNCTION public.delete_old_visitor_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old visitor projects and related data
  DELETE FROM public.projects
  WHERE user_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'visitor'
  )
  AND created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete old visitor videos (orphaned ones without projects)
  DELETE FROM public.videos
  WHERE user_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'visitor'
  )
  AND created_at < NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.video_id = videos.id
  );
END;
$$;

-- Note: The function is created but cron scheduling needs to be done via Supabase dashboard
-- Users should set up a cron job to run this function daily

-- ============================================
-- HELPER FUNCTION TO CHECK IF USER IS VISITOR
-- ============================================

CREATE OR REPLACE FUNCTION public.is_visitor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'visitor'
  )
$$;

-- ============================================
-- UPDATE HANDLE_NEW_USER FUNCTION
-- ============================================

-- Update the trigger function to assign 'visitor' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  
  -- Assign default 'visitor' role (users need to upgrade)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'visitor');
  
  RETURN NEW;
END;
$$;