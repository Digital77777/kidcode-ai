-- Create classes table for educators to manage groups of students
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  educator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Educators can manage their own classes
CREATE POLICY "Educators can view their own classes"
ON public.classes FOR SELECT
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

CREATE POLICY "Educators can create classes"
ON public.classes FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

CREATE POLICY "Educators can update their own classes"
ON public.classes FOR UPDATE
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

CREATE POLICY "Educators can delete their own classes"
ON public.classes FOR DELETE
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

-- Create class_enrollments table to link students to classes
CREATE TABLE public.class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Educators can manage enrollments for their classes
CREATE POLICY "Educators can view enrollments in their classes"
ON public.class_enrollments FOR SELECT
USING (
  public.has_role(auth.uid(), 'educator') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_enrollments.class_id 
    AND classes.educator_id = auth.uid()
  )
);

CREATE POLICY "Educators can add students to their classes"
ON public.class_enrollments FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'educator') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_enrollments.class_id 
    AND classes.educator_id = auth.uid()
  )
);

CREATE POLICY "Educators can remove students from their classes"
ON public.class_enrollments FOR DELETE
USING (
  public.has_role(auth.uid(), 'educator') AND 
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_enrollments.class_id 
    AND classes.educator_id = auth.uid()
  )
);

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments"
ON public.class_enrollments FOR SELECT
USING (public.has_role(auth.uid(), 'student') AND student_id = auth.uid());

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  educator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_id TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Educators can manage assignments for their classes
CREATE POLICY "Educators can view assignments in their classes"
ON public.assignments FOR SELECT
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

CREATE POLICY "Educators can create assignments"
ON public.assignments FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'educator') AND 
  educator_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = assignments.class_id 
    AND classes.educator_id = auth.uid()
  )
);

CREATE POLICY "Educators can update their assignments"
ON public.assignments FOR UPDATE
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

CREATE POLICY "Educators can delete their assignments"
ON public.assignments FOR DELETE
USING (public.has_role(auth.uid(), 'educator') AND educator_id = auth.uid());

-- Students can view assignments for classes they're enrolled in
CREATE POLICY "Students can view their class assignments"
ON public.assignments FOR SELECT
USING (
  public.has_role(auth.uid(), 'student') AND 
  EXISTS (
    SELECT 1 FROM public.class_enrollments 
    WHERE class_enrollments.class_id = assignments.class_id 
    AND class_enrollments.student_id = auth.uid()
  )
);

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Educators can view submissions for their assignments
CREATE POLICY "Educators can view submissions for their assignments"
ON public.assignment_submissions FOR SELECT
USING (
  public.has_role(auth.uid(), 'educator') AND 
  EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE assignments.id = assignment_submissions.assignment_id 
    AND assignments.educator_id = auth.uid()
  )
);

CREATE POLICY "Educators can update submissions for their assignments"
ON public.assignment_submissions FOR UPDATE
USING (
  public.has_role(auth.uid(), 'educator') AND 
  EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE assignments.id = assignment_submissions.assignment_id 
    AND assignments.educator_id = auth.uid()
  )
);

-- Students can manage their own submissions
CREATE POLICY "Students can view their own submissions"
ON public.assignment_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'student') AND student_id = auth.uid());

CREATE POLICY "Students can create their own submissions"
ON public.assignment_submissions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'student') AND student_id = auth.uid());

CREATE POLICY "Students can update their own submissions"
ON public.assignment_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'student') AND student_id = auth.uid());

-- Add trigger for updated_at on classes
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on assignments
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on assignment_submissions
CREATE TRIGGER update_assignment_submissions_updated_at
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();