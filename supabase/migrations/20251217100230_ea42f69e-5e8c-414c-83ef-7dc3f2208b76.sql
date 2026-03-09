-- Add explicit policies to deny anonymous access to sensitive tables

-- Profiles table - deny anonymous SELECT access
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Contact messages - already has admin-only SELECT, add explicit anon denial
CREATE POLICY "Deny anonymous access to contact_messages"
ON public.contact_messages
FOR SELECT
TO anon
USING (false);

-- Repair partners - deny anonymous SELECT access
CREATE POLICY "Deny anonymous access to repair_partners"
ON public.repair_partners
FOR SELECT
TO anon
USING (false);