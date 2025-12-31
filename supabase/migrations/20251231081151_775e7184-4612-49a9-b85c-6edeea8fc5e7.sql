-- Fix PUBLIC_USER_DATA: Restrict profiles table to only allow users to view their own profile
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a new restrictive policy: users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);