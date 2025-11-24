-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false);

-- Allow students to upload files for their own submissions
CREATE POLICY "Students can upload their submission files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  has_role(auth.uid(), 'student'::app_role)
);

-- Allow students to view their own submission files
CREATE POLICY "Students can view their own submission files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignment-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow students to delete their own submission files
CREATE POLICY "Students can delete their own submission files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  has_role(auth.uid(), 'student'::app_role)
);

-- Allow educators to view submission files from their assignments
CREATE POLICY "Educators can view submission files from their classes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignment-submissions' AND
  has_role(auth.uid(), 'educator'::app_role) AND
  EXISTS (
    SELECT 1
    FROM assignment_submissions asub
    JOIN assignments a ON a.id = asub.assignment_id
    WHERE a.educator_id = auth.uid()
    AND (storage.foldername(name))[1] = asub.student_id::text
  )
);

-- Add file_urls column to assignment_submissions table
ALTER TABLE assignment_submissions
ADD COLUMN IF NOT EXISTS file_urls jsonb DEFAULT '[]'::jsonb;