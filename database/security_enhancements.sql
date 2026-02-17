-- SECURITY ENHANCEMENTS FOR HIPAA COMPLIANCE
-- Run this in your Supabase SQL Editor

-- 1. Create Audit Logs Table
-- Tracks who accessed/modified what data (Critical for HIPAA)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN'
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  occurred_at timestamp with time zone default now()
);

-- Secure the Audit Log (Only Admins can view)
alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs" on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. Enhance Profile Privacy (Fixing the "Public profiles are viewable by everyone" issue)
-- DROP the existing insecure policy if it exists
-- drop policy "Public profiles are viewable by everyone" on public.profiles;

create policy "Everyone can view Doctor profiles" 
  on public.profiles for select 
  using (role = 'doctor');

create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Doctors can view their Patients' profiles" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.appointments
      where doctor_id = auth.uid() 
      and patient_id = public.profiles.id
    )
  );

-- 3. Automated Audit Trigger Function
create or replace function public.log_sensitive_action()
returns trigger as $$
begin
  insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    row_to_json(old),
    row_to_json(new)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Apply Audit Triggers to Sensitive Tables
-- Medical Reports
drop trigger if exists on_report_change on public.reports;
create trigger on_report_change
  after insert or update or delete on public.reports
  for each row execute procedure public.log_sensitive_action();

-- Prescriptions
drop trigger if exists on_prescription_change on public.prescriptions;
create trigger on_prescription_change
  after insert or update or delete on public.prescriptions
  for each row execute procedure public.log_sensitive_action();
