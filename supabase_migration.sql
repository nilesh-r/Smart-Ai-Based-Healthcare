-- Create supplements table
create table if not exists supplements (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null, -- e.g., 'Vitamin', 'Mineral', 'Booster'
  dosage text, -- e.g., '500mg'
  frequency text, -- e.g., 'Daily'
  color text default 'blue', -- e.g., 'blue', 'green', 'orange' for UI
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table supplements enable row level security;

-- Create policies
create policy "Users can view their own supplements"
  on supplements for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own supplements"
  on supplements for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own supplements"
  on supplements for update
  using (auth.uid() = patient_id);

create policy "Users can delete their own supplements"
  on supplements for delete
  using (auth.uid() = patient_id);

-- Create health_metrics table
create table if not exists health_metrics (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  metric_type text not null, -- 'Heart Rate', 'Blood Pressure', 'Water', 'Sleep', 'Weight'
  value numeric not null,
  unit text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for health_metrics
alter table health_metrics enable row level security;

-- Policies for health_metrics
create policy "Users can view their own health metrics" on health_metrics for select using (auth.uid() = patient_id);
create policy "Users can insert their own health metrics" on health_metrics for insert with check (auth.uid() = patient_id);
create policy "Users can update their own health metrics" on health_metrics for update using (auth.uid() = patient_id);
create policy "Users can delete their own health metrics" on health_metrics for delete using (auth.uid() = patient_id);

-- Create prescriptions table
create table if not exists prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete set null, -- Optional link to doctor
  medication_name text not null,
  dosage text not null, -- e.g., '500mg'
  frequency text not null, -- e.g., 'Twice daily'
  duration text, -- e.g., '7 days'
  instructions text, -- e.g., 'Take after food'
  prescribed_date date default CURRENT_DATE,
  status text default 'active' -- 'active', 'completed', 'discontinued'
);

-- Enable RLS for prescriptions
alter table prescriptions enable row level security;

-- Policies for prescriptions
create policy "Users can view their own prescriptions" 
  on prescriptions for select 
  using (auth.uid() = patient_id);

create policy "Doctors can insert prescriptions for patients" 
  on prescriptions for insert 
  with check (auth.uid() = doctor_id); 
  -- Note: This might need adjustment based on how doctors are identified in auth. 
  -- For now, we'll allow patients to insert their own external prescriptions too?
  -- Let's allow users to insert their own for now to make it functional as a tracker.

create policy "Users can insert their own prescriptions" 
  on prescriptions for insert 
  with check (auth.uid() = patient_id);

create policy "Users can update their own prescriptions" 
  on prescriptions for update 
  using (auth.uid() = patient_id);

-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean default false,
  link text, -- optional link to navigate to
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notifications
alter table notifications enable row level security;

-- Policies for notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);
  
-- Allow system/functions to insert notifications (broadly for now, or just authenticated users to notify themselves/others if needed layout allows it)
create policy "Users can insert notifications"
  on notifications for insert
  with check (auth.uid() = user_id); -- Strict for now, maybe relax if doctors notify patients
