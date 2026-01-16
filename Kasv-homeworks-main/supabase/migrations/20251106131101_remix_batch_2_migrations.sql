
-- Migration: 20251105102513
-- Create homeworks table to store homework submissions
CREATE TABLE public.homeworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  homework_date DATE NOT NULL,
  subject TEXT NOT NULL,
  homework_text TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homeworks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view homeworks
CREATE POLICY "Anyone can view homeworks" 
ON public.homeworks 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert homeworks (since we're using password protection in the app)
CREATE POLICY "Anyone can insert homeworks" 
ON public.homeworks 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to delete homeworks
CREATE POLICY "Anyone can delete homeworks" 
ON public.homeworks 
FOR DELETE 
USING (true);

-- Create notes table for note-taking
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes
CREATE POLICY "Anyone can view notes" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update notes" 
ON public.notes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete notes" 
ON public.notes 
FOR DELETE 
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on notes
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251106122256
-- Create a table for subject notes with images
CREATE TABLE public.subject_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subject_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing pattern)
CREATE POLICY "Anyone can view subject notes" 
ON public.subject_notes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert subject notes" 
ON public.subject_notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete subject notes" 
ON public.subject_notes 
FOR DELETE 
USING (true);
