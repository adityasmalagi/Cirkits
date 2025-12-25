-- Create table for user-submitted projects
CREATE TABLE public.user_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  difficulty difficulty_level DEFAULT 'beginner',
  estimated_cost NUMERIC,
  estimated_time TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user project components/parts
CREATE TABLE public.user_project_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_project_id UUID NOT NULL REFERENCES public.user_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  quantity INTEGER DEFAULT 1,
  affiliate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_parts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_projects
CREATE POLICY "Users can view own projects" 
ON public.user_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" 
ON public.user_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
ON public.user_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
ON public.user_projects 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all projects" 
ON public.user_projects 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all projects" 
ON public.user_projects 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_project_parts
CREATE POLICY "Users can view own project parts" 
ON public.user_project_parts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_projects 
    WHERE id = user_project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own project parts" 
ON public.user_project_parts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_projects 
    WHERE id = user_project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own project parts" 
ON public.user_project_parts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_projects 
    WHERE id = user_project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own project parts" 
ON public.user_project_parts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_projects 
    WHERE id = user_project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all project parts" 
ON public.user_project_parts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_projects_updated_at
BEFORE UPDATE ON public.user_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();