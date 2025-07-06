ALTER TABLE public.groups
ALTER COLUMN monthly_amount TYPE NUMERIC;

ALTER TABLE public.contributions
ALTER COLUMN amount TYPE NUMERIC;
