
-- Fix the default value for current_members to start at 0
ALTER TABLE public.groups ALTER COLUMN current_members SET DEFAULT 0;

-- Update existing groups to have correct member counts
UPDATE public.groups 
SET current_members = (
  SELECT COUNT(*) 
  FROM public.group_members 
  WHERE group_members.group_id = groups.id
);
