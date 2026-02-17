-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('patient', 'doctor', 'admin')) default 'patient',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCTORS (Additional details for doctors)
create table public.doctors (
  id uuid references public.profiles(id) on delete cascade primary key,
  specialization text not null,
  experience_years integer default 0,
  bio text,
  consultation_fee numeric default 0,
  available_days text[], -- e.g. ['Monday', 'Wednesday']
  rating numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- APPOINTMENTS
create table public.appointments (
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
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.doctors(id), -- Optional, can be uploaded by patient directly
  title text not null,
  file_url text not null,
  report_date date default current_date,
  health_metric_name text, -- e.g., 'Hemoglobin', 'Sugar Level'
  health_metric_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRESCRIPTIONS
create table public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) not null,
  medicines jsonb not null, -- Array of objects: { name, dosage, duration }
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references public.doctors(id) not null,
  patient_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.reports enable row level security;
alter table public.prescriptions enable row level security;
alter table public.reviews enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Policies for Doctors
create policy "Doctors are viewable by everyone" on public.doctors for select using (true);
create policy "Doctors can update their own info" on public.doctors for update using (auth.uid() = id);

-- Policies for Appointments
create policy "Patients can view their own appointments" on public.appointments for select using (auth.uid() = patient_id);
create policy "Doctors can view appointments assigned to them" on public.appointments for select using (auth.uid() = doctor_id);
create policy "Patients can insert appointments" on public.appointments for insert with check (auth.uid() = patient_id);
create policy "Doctors can update appointment status" on public.appointments for update using (auth.uid() = doctor_id);

-- TRIGGER: Create profile after signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'patient'));
  
  -- If role is doctor, insert into doctors table too (optional, usually doctors need verification)
  if (new.raw_user_meta_data->>'role' = 'doctor') then
    insert into public.doctors (id, specialization) values (new.id, 'General Physician');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- MESSAGES (Chat system)
create table public.messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.profiles(id) not null,
    receiver_id uuid references public.profiles(id) not null,
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Messages
alter table public.messages enable row level security;

create policy "Users can view their own messages" on public.messages
    for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages" on public.messages
    for insert with check (auth.uid() = sender_id);