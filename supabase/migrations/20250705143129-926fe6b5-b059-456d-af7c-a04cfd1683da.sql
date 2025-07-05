
-- First, let's see the current policy
SELECT policy_name, policy_cmd, policy_permissive, policy_roles, policy_qual, policy_with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'groups';

-- Update the RLS policy to properly handle private groups with secret codes
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND
  (
    type IN ('public', 'community') OR 
    (type = 'private' AND secret_code IS NOT NULL AND secret_code != '')
  )
);
