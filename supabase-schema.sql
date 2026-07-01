create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint users_email_lowercase check (email = lower(email))
);

create table if not exists public.timesheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  year integer not null,
  week_number integer not null check (week_number between 1 and 53),
  week_start timestamptz not null,
  week_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, week_number)
);

create table if not exists public.timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references public.timesheets(id) on delete cascade,
  date timestamptz not null,
  project text not null,
  type_of_work text not null,
  task_description text not null,
  hours_worked numeric not null check (hours_worked > 0),
  created_at timestamptz not null default now()
);

create index if not exists timesheets_user_week_idx
  on public.timesheets (user_id, year, week_number);

create index if not exists timesheets_user_dates_idx
  on public.timesheets (user_id, week_start, week_end);

create index if not exists timesheet_entries_timesheet_date_idx
  on public.timesheet_entries (timesheet_id, date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists timesheets_set_updated_at on public.timesheets;
create trigger timesheets_set_updated_at
before update on public.timesheets
for each row
execute function public.set_updated_at();

