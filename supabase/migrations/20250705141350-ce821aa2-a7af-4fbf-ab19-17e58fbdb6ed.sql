
-- Update the RLS policy to allow users to create private groups
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND
  (
    type IN ('public', 'community') OR 
    (type = 'private' AND secret_code IS NOT NULL)
  )
);
