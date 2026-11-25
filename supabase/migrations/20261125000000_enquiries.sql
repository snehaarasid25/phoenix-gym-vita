-- Stage 1: enquiries (leads) + admin access
-- Visitors can only ADD an enquiry. Only admins (the gym owner) can read, update or delete.

-- ── Admins ────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create policy "admins can see their own row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- Helper used by policies (security definer so it can read admins regardless of RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── Enquiries ─────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  phone text not null check (phone ~ '^[0-9+ ()-]{7,20}$'),
  interest text check (interest is null or char_length(interest) <= 120),
  message text check (message is null or char_length(message) <= 1000),
  consent boolean not null check (consent),            -- DPDP: the visitor agreed to be contacted
  status text not null default 'new'
    check (status in ('new', 'contacted', 'visited', 'joined', 'closed')),
  notes text check (notes is null or char_length(notes) <= 2000),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
alter table public.enquiries enable row level security;

-- Public (anon) may only insert brand-new enquiries; they can never read anything back.
create policy "anyone can submit an enquiry"
  on public.enquiries for insert to anon, authenticated
  with check (status = 'new' and notes is null);

create policy "admins read enquiries"
  on public.enquiries for select to authenticated
  using (public.is_admin());

create policy "admins update enquiries"
  on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins delete enquiries"
  on public.enquiries for delete to authenticated
  using (public.is_admin());

-- Column-level privileges: the public role can insert only these columns.
revoke all on public.enquiries from anon;
grant insert (name, phone, interest, message, consent) on public.enquiries to anon;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists enquiries_touch on public.enquiries;
create trigger enquiries_touch before update on public.enquiries
  for each row execute function public.touch_updated_at();
