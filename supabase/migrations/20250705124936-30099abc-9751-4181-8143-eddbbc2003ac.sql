
-- Drop the problematic policy
DROP POLICY IF EXISTS "Group members can view group membership" ON public.group_members;

-- Create a security definer function to get user's groups safely
CREATE OR REPLACE FUNCTION public.get_user_groups(user_uuid UUID)
RETURNS TABLE(group_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE gm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a new policy that uses the security definer function
CREATE POLICY "Group members can view group membership" ON public.group_members 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    group_members.group_id IN (SELECT group_id FROM public.get_user_groups(auth.uid()))
  );
