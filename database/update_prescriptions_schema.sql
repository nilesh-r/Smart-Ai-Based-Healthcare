-- Update PRESCRIPTIONS table to support standalone prescription pad usage
-- (Making appointment_id optional and adding direct patient details)

-- 1. Allow prescriptions without an appointment (Standalone)
alter table public.prescriptions alter column appointment_id drop not null;

-- 2. Add columns to store patient details directly (if not linked to a profile)
alter table public.prescriptions add column if not exists patient_name text;
alter table public.prescriptions add column if not exists patient_age text;
alter table public.prescriptions add column if not exists patient_gender text;
alter table public.prescriptions add column if not exists diagnosis text;

-- 3. Link to the Doctor creating it
alter table public.prescriptions add column if not exists doctor_id uuid references public.doctors(id);

-- 4. Update Policy to allow Doctors to insert
drop policy if exists "Doctors can create prescriptions" on public.prescriptions;
create policy "Doctors can create prescriptions" 
  on public.prescriptions 
  for insert 
  with check (auth.uid() = doctor_id);

-- 5. Update Policy to allow Doctors to view their own prescriptions
drop policy if exists "Doctors can view their own prescriptions" on public.prescriptions;
create policy "Doctors can view their own prescriptions" 
  on public.prescriptions 
  for select 
  using (auth.uid() = doctor_id);
