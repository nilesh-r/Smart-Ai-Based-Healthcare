
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
