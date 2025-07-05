
-- First, let's check if the profile exists
SELECT id, full_name, username FROM public.profiles WHERE id = 'fcb220de-ab24-4157-b34d-cb50e261bd0f';

-- If the profile doesn't exist, create it manually
INSERT INTO public.profiles (id, full_name, username, community_score)
VALUES ('fcb220de-ab24-4157-b34d-cb50e261bd0f', 'User', 'siddesh.public@gmail.com', 100)
ON CONFLICT (id) DO NOTHING;

-- Let's also ensure the trigger function works properly for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, community_score)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    100
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
