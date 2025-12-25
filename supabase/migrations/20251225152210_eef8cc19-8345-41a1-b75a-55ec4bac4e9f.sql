-- Add phone_number, bio, and location columns to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;
ALTER TABLE public.profiles ADD COLUMN bio text;
ALTER TABLE public.profiles ADD COLUMN location text;