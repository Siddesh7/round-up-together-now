
-- Extend groups table with Telegram verification fields
ALTER TABLE public.groups 
ADD COLUMN telegram_group_handle TEXT,
ADD COLUMN telegram_verification_enabled BOOLEAN DEFAULT false,
ADD COLUMN min_membership_months INTEGER DEFAULT 6,
ADD COLUMN telegram_verification_criteria JSONB;

-- Create enum for verification status
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'expired');

-- Create user_telegram_verification table
CREATE TABLE public.user_telegram_verification (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_username TEXT NOT NULL,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    verification_status verification_status DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_data JSONB,
    verification_attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint to prevent duplicate verification requests
ALTER TABLE public.user_telegram_verification 
ADD CONSTRAINT unique_user_group_verification 
UNIQUE (user_id, group_id);

-- Enable RLS on the verification table
ALTER TABLE public.user_telegram_verification ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification records
CREATE POLICY "Users can view own verification records" 
ON public.user_telegram_verification 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own verification records
CREATE POLICY "Users can create own verification records" 
ON public.user_telegram_verification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification records
CREATE POLICY "Users can update own verification records" 
ON public.user_telegram_verification 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Group creators can view verification records for their groups
CREATE POLICY "Group creators can view verification records" 
ON public.user_telegram_verification 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE id = group_id AND creator_id = auth.uid()
    )
);
