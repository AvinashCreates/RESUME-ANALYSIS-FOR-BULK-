-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'recruiter', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_descriptions table
CREATE TABLE public.job_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  required_skills TEXT[],
  preferred_skills TEXT[],
  experience_level TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_description_id UUID REFERENCES public.job_descriptions ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_results table
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes ON DELETE CASCADE,
  job_description_id UUID NOT NULL REFERENCES public.job_descriptions ON DELETE CASCADE,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  verdict TEXT CHECK (verdict IN ('High', 'Medium', 'Low')),
  hard_match_score INTEGER,
  soft_match_score INTEGER,
  missing_skills TEXT[],
  improvement_suggestions TEXT[],
  detailed_analysis JSONB,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create batch_jobs table for bulk processing
CREATE TABLE public.batch_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_description_id UUID NOT NULL REFERENCES public.job_descriptions ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_resumes INTEGER DEFAULT 0,
  processed_resumes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for job_descriptions
CREATE POLICY "Users can view their own job descriptions" ON public.job_descriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create job descriptions" ON public.job_descriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job descriptions" ON public.job_descriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job descriptions" ON public.job_descriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for resumes
CREATE POLICY "Users can view their own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for analysis_results
CREATE POLICY "Users can view analysis results for their resumes" ON public.analysis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = analysis_results.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analysis results" ON public.analysis_results
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for batch_jobs
CREATE POLICY "Users can view their own batch jobs" ON public.batch_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create batch jobs" ON public.batch_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch jobs" ON public.batch_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at
  BEFORE UPDATE ON public.job_descriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();