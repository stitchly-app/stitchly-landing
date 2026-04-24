-- Create enum types for status fields
CREATE TYPE video_status AS ENUM ('uploaded', 'processing', 'processed', 'deleted');
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'done', 'failed');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE app_role AS ENUM ('visitor', 'user', 'admin');
CREATE TYPE audit_entity AS ENUM ('video', 'project', 'export', 'user');
CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'exported', 'accessed');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (CRITICAL: roles must be separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'visitor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  original_name TEXT NOT NULL,
  duration NUMERIC(10, 2),
  resolution TEXT,
  aspect_ratio TEXT,
  size BIGINT,
  status video_status NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create full-text search index on videos.original_name
CREATE INDEX idx_videos_original_name_search ON public.videos USING gin(to_tsvector('english', original_name));

-- Create indexes for videos
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_org_id ON public.videos(org_id);
CREATE INDEX idx_videos_status ON public.videos(status);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  edits_json JSONB DEFAULT '[]'::jsonb,
  format_settings_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create indexes for projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_video_id ON public.projects(video_id);

-- Create exports table
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  output_url TEXT,
  format TEXT NOT NULL DEFAULT 'mp4',
  resolution TEXT,
  aspect_ratio TEXT,
  status export_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on exports
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Create indexes for exports
CREATE INDEX idx_exports_project_id ON public.exports(project_id);
CREATE INDEX idx_exports_video_id ON public.exports(video_id);
CREATE INDEX idx_exports_status ON public.exports(status);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity audit_entity NOT NULL,
  action audit_action NOT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for audit_log
CREATE INDEX idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all videos"
  ON public.videos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exports
CREATE POLICY "Users can view exports for their projects"
  ON public.exports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = exports.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exports for their projects"
  ON public.exports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = exports.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exports for their projects"
  ON public.exports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = exports.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for audit_log
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = actor_id);

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));