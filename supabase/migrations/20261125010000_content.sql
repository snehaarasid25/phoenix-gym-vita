-- Stage 2 + 3: owner-editable site content (plans, offers, reviews, launch status, hours)
-- Public (anon) can READ what's visible; only admins can write. Saving content triggers a Netlify rebuild.

-- ── Site settings (single row) ────────────────────────────────────────────
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  launch_status text not null default 'prebooking-soon'
    check (launch_status in ('prebooking-soon', 'prebooking-open', 'open')),
  hours jsonb,                       -- [{ "days": "Mon – Sat", "hours": "5:30 AM – 10 PM" }, …] or null
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ── Membership plans ─────────────────────────────────────────────────────
create table if not exists public.plans (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  sort int not null default 0,
  name text not null check (char_length(name) between 1 and 40),
  duration text not null check (char_length(duration) between 1 and 40),
  price int check (price is null or price between 0 and 1000000),   -- INR; null = "Price on enquiry"
  price_note text check (price_note is null or char_length(price_note) <= 30),
  benefits text[] not null default '{}',
  highlight boolean not null default false,
  highlight_label text check (highlight_label is null or char_length(highlight_label) <= 40),
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ── Offers (occasion discounts) ──────────────────────────────────────────
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 60),        -- e.g. "Diwali offer"
  description text check (description is null or char_length(description) <= 200),
  discount_percent int check (discount_percent is null or discount_percent between 1 and 90),
  plan_ids text[] not null default '{}',                                  -- empty = applies to all plans
  starts_on date not null,
  ends_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- ── Reviews ──────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  sort int not null default 0,
  name text not null check (char_length(name) between 1 and 60),
  detail text not null default '' check (char_length(detail) <= 60),     -- e.g. "Pre-booked member"
  quote text not null check (char_length(quote) between 1 and 600),
  highlight text check (highlight is null or char_length(highlight) <= 120),
  photo_url text check (photo_url is null or char_length(photo_url) <= 500),
  is_sample boolean not null default false,                              -- always labelled on the site
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Row-level security ───────────────────────────────────────────────────
alter table public.site_settings enable row level security;
alter table public.plans enable row level security;
alter table public.offers enable row level security;
alter table public.reviews enable row level security;

create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public reads visible plans" on public.plans for select to anon, authenticated using (visible or public.is_admin());
create policy "public reads active offers" on public.offers for select to anon, authenticated using (active or public.is_admin());
create policy "public reads visible reviews" on public.reviews for select to anon, authenticated using (visible or public.is_admin());

create policy "admins write settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins write plans" on public.plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins write offers" on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins write reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke insert, update, delete on public.site_settings, public.plans, public.offers, public.reviews from anon;

-- ── Review photos (public bucket; only admins upload/replace/delete) ──────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admins upload review photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'review-photos' and public.is_admin());
create policy "admins update review photos" on storage.objects for update to authenticated
  using (bucket_id = 'review-photos' and public.is_admin());
create policy "admins delete review photos" on storage.objects for delete to authenticated
  using (bucket_id = 'review-photos' and public.is_admin());

-- ── Auto-publish: any content change pings the Netlify build hook ────────
-- The hook URL lives in a private schema that the website/API can't read.
create extension if not exists pg_net with schema extensions;
create schema if not exists private;
revoke all on schema private from anon, authenticated;
create table if not exists private.config (key text primary key, value text not null);

create or replace function private.trigger_rebuild()
returns trigger
language plpgsql
security definer
set search_path = private, extensions, public
as $$
declare hook text;
begin
  select value into hook from private.config where key = 'netlify_build_hook';
  if hook is not null and hook <> '' then
    perform net.http_post(url := hook, body := '{}'::jsonb);
  end if;
  return null;
end;
$$;

drop trigger if exists rebuild_on_settings on public.site_settings;
drop trigger if exists rebuild_on_plans on public.plans;
drop trigger if exists rebuild_on_offers on public.offers;
drop trigger if exists rebuild_on_reviews on public.reviews;
create trigger rebuild_on_settings after insert or update or delete on public.site_settings for each statement execute function private.trigger_rebuild();
create trigger rebuild_on_plans after insert or update or delete on public.plans for each statement execute function private.trigger_rebuild();
create trigger rebuild_on_offers after insert or update or delete on public.offers for each statement execute function private.trigger_rebuild();
create trigger rebuild_on_reviews after insert or update or delete on public.reviews for each statement execute function private.trigger_rebuild();

-- ── Seed with the website's current content ───────────────────────────────
insert into public.plans (id, sort, name, duration, benefits, highlight, highlight_label) values
  ('monthly', 1, 'Monthly', '1 Month', array['Full gym floor access', 'Strength & cardio zones', 'Orientation on first visit'], false, null),
  ('quarterly', 2, 'Quarterly', '3 Months', array['Everything in Monthly', 'Enough time to build a real habit', 'Progress check-ins'], false, null),
  ('half-yearly', 3, 'Half-Yearly', '6 Months', array['Everything in Quarterly', 'Long-term programme guidance', 'Priority trainer support'], false, null),
  ('annual', 4, 'Annual', '12 Months', array['Everything in Half-Yearly', 'A full year of training', 'Best for serious transformation'], true, 'Full-year commitment')
on conflict (id) do nothing;

insert into public.reviews (sort, name, detail, quote, highlight, photo_url, is_sample)
select * from (values
  (1, 'Sneha A.', 'Pre-booked member',
   'Vita has never had a gym like this. The space looks stunning, and having HYROX training, a steam bath and a calm yoga area under one roof is a game changer. I’ve pre-booked my membership and I’m honestly counting down the days to my first session!',
   'counting down the days to my first session', '/images/testimonials/sneha-160.webp', false),
  (2, 'Sample Member', 'Sample', 'Sample review: the energy on the floor keeps you coming back. You walk in tired and leave fired up.', null, null, true),
  (3, 'Sample Member', 'Sample', 'Sample review: I finally have a routine that sticks. The focus on form made all the difference for me.', null, null, true),
  (4, 'Sample Member', 'Sample', 'Sample review: serious atmosphere, clean equipment and people who actually train. Exactly what Vita needed.', null, null, true)
) as v(sort, name, detail, quote, highlight, photo_url, is_sample)
where not exists (select 1 from public.reviews);
