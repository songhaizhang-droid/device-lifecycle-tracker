create table if not exists public.stations (
  code text primary key,
  name text not null
);

create table if not exists public.agents (
  agent_id text primary key,
  full_name text not null,
  role text not null check (role in ('Agent', 'Admin/Supervisor')),
  username text unique not null,
  password text not null
);

create table if not exists public.devices (
  serial_number text primary key,
  device_name text not null,
  station_code text not null references public.stations(code),
  barcode_value text unique not null,
  status text not null check (status in ('Available', 'Checked Out', 'In Repair', 'Lost', 'Retired')),
  warranty_expiration_date timestamptz not null,
  last_seen_online timestamptz not null,
  current_assigned_agent_id text references public.agents(agent_id)
);

create table if not exists public.checkout_history (
  transaction_id text primary key,
  device_serial text not null references public.devices(serial_number),
  agent_id text not null references public.agents(agent_id),
  checkout_at timestamptz not null,
  checkout_duration_days integer not null default 1,
  checkin_at timestamptz,
  transaction_status text not null check (transaction_status in ('Active', 'Closed'))
);

create table if not exists public.repair_tickets (
  ticket_id text primary key,
  device_serial text not null references public.devices(serial_number),
  reported_by_agent_id text not null references public.agents(agent_id),
  date_reported timestamptz not null,
  issue_description text not null,
  repair_status text not null check (repair_status in ('Pending', 'In Progress', 'Resolved'))
);
