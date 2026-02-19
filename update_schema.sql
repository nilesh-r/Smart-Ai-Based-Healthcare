-- Add appointment_id to prescriptions table
alter table prescriptions 
add column if not exists appointment_id uuid references appointments(id) on delete cascade;
