-- Run this in your Supabase SQL Editor

-- 1. Create the Master Table (if not exists)
create table if not exists master_uploads (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  table_name text not null
);

-- 2. Create the RPC function to create tables with the FIXED schema
create or replace function create_leads_table(
  table_name text
) returns void
language plpgsql
security definer
as $$
begin
  -- Basic sanitation
  if table_name !~ '^[a-zA-Z0-9_]+$' then
    raise exception 'Invalid table name';
  end if;

  execute format('
    create table %I (
      id uuid default uuid_generate_v4() primary key,
      "date" date,
      "lead_owner" text,
      "source" text,
      "deal_stage" text,
      "account_id" text,
      "first_name" text,
      "last_name" text,
      "company" text
    );
  ', table_name);
end;
$$;
