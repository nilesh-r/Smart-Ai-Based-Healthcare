-- 1. First, Sign Up on the website using this email: nileshsahu8674@gmail.com
-- 2. Then run this SQL command in your Supabase SQL Editor:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'nileshsahu8674@gmail.com';

-- Verify the change:
SELECT email, role FROM public.profiles WHERE email = 'nileshsahu8674@gmail.com';
