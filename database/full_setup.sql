-- ==========================================
-- 1. BASE SCHEMA (Tables & Relations)
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('patient', 'doctor', 'admin')) default 'patient',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCTORS (Additional details for doctors)
create table if not exists public.doctors (
  id uuid references public.profiles(id) on delete cascade primary key,
  specialization text not null,
  experience_years integer default 0,
  bio text,
  consultation_fee numeric default 0,
  available_days text[],
  rating numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- APPOINTMENTS
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.doctors(id) not null,
  appointment_date date not null,
  appointment_time time not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  symptoms text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEDICAL REPORTS
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.doctors(id), -- Optional, can be uploaded by patient directly
  title text not null,
  file_url text not null,
  report_date date default current_date,
  health_metric_name text,
  health_metric_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRESCRIPTIONS
create table if not exists public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) not null,
  medicines jsonb not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references public.doctors(id) not null,
  patient_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES (Chat system)
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.profiles(id) not null,
    receiver_id uuid references public.profiles(id) not null,
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.reports enable row level security;
alter table public.prescriptions enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- ==========================================
-- 3. BASIC POLICIES (Idempotent: Drop first)
-- ==========================================

-- Profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Doctors
drop policy if exists "Doctors are viewable by everyone" on public.doctors;
create policy "Doctors are viewable by everyone" on public.doctors for select using (true);

drop policy if exists "Doctors can update their own info" on public.doctors;
create policy "Doctors can update their own info" on public.doctors for update using (auth.uid() = id);

drop policy if exists "Doctors can insert their own info" on public.doctors;
create policy "Doctors can insert their own info" on public.doctors for insert with check (auth.uid() = id);

-- Appointments
drop policy if exists "Patients can view their own appointments" on public.appointments;
create policy "Patients can view their own appointments" on public.appointments for select using (auth.uid() = patient_id);

drop policy if exists "Doctors can view appointments assigned to them" on public.appointments;
create policy "Doctors can view appointments assigned to them" on public.appointments for select using (auth.uid() = doctor_id);

drop policy if exists "Patients can insert appointments" on public.appointments;
create policy "Patients can insert appointments" on public.appointments for insert with check (auth.uid() = patient_id);

drop policy if exists "Doctors can update appointment status" on public.appointments;
create policy "Doctors can update appointment status" on public.appointments for update using (auth.uid() = doctor_id);

-- Messages
drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages" on public.messages
    for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages" on public.messages
    for insert with check (auth.uid() = sender_id);


-- ==========================================
-- 4. TRIGGERS (User Creation)
-- ==========================================
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'patient'));
  
  if (new.raw_user_meta_data->>'role' = 'doctor') then
    insert into public.doctors (id, specialization) values (new.id, 'General Physician');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 5. SECURITY ENHANCEMENTS (HIPAA / Audit)
-- ==========================================

-- Audit Logs Table
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

alter table public.audit_logs enable row level security;

-- Only Admins View Logs
drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs" on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Enhanced Profile Privacy (Override basic policies if stricter needed)
drop policy if exists "Everyone can view Doctor profiles" on public.profiles;
create policy "Everyone can view Doctor profiles" 
  on public.profiles for select 
  using (role = 'doctor');

drop policy if exists "Doctors can view their Patients' profiles" on public.profiles;
create policy "Doctors can view their Patients' profiles" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.appointments
      where doctor_id = auth.uid() 
      and patient_id = public.profiles.id
    )
  );

-- Automated Audit Trigger Function
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

-- Apply Triggers
drop trigger if exists on_report_change on public.reports;
create trigger on_report_change
  after insert or update or delete on public.reports
  for each row execute procedure public.log_sensitive_action();

drop trigger if exists on_prescription_change on public.prescriptions;
create trigger on_prescription_change
  after insert or update or delete on public.prescriptions
  for each row execute procedure public.log_sensitive_action();
