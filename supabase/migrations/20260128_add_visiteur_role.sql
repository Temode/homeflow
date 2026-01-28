-- Add 'visiteur' to allowed roles in profiles table
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('visiteur', 'locataire', 'demarcheur', 'proprietaire'));
