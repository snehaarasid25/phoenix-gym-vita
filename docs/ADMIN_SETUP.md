# Admin: connecting Supabase

The owner's private dashboard at **/admin** has five tabs: **Enquiries** (inbox), **Plans**, **Offers**, **Reviews** and **Settings**.
The site keeps working without Supabase (the form still opens WhatsApp); these steps switch saving on.

## 1. Create the database tables
Supabase dashboard → your project → **SQL Editor** → New query → paste the whole file
`supabase/migrations/20261125000000_enquiries.sql` → **Run**.

## 2. Lock down sign-ups
**Authentication → Sign In / Providers → Email**: keep Email enabled, and turn **"Allow new users to sign up"** OFF.
Only accounts you create yourself can log in.

## 3. Create the owner's login
**Authentication → Users → Add user → Create new user**: owner's email + a strong password, tick **Auto Confirm User**.

## 4. Make that user an admin
SQL Editor → run (replace the email):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'owner@example.com';
```

## 5. Password-reset links
**Authentication → URL Configuration**:
- Site URL: `https://phoenixgymvita.netlify.app` (the real domain later)
- Redirect URLs: add `https://phoenixgymvita.netlify.app/admin`

## 6. Website connection
Already done: the project URL and publishable key are set as defaults in `src/utils/supabase.ts`
(both are public by design). To point at another project, set `PUBLIC_SUPABASE_URL` and
`PUBLIC_SUPABASE_ANON_KEY` in `.env` / Netlify environment variables. Never use the service_role / secret key.

## 7. Editable content (plans, offers, reviews, settings)
SQL Editor → New query → paste the whole file `supabase/migrations/20261125010000_content.sql` → **Run**.
It creates the content tables, the `review-photos` storage bucket, and seeds them with the site's current plans and reviews.

## 8. Auto-publish (save in /admin → live site rebuilds)
1. Netlify → the site → **Site configuration → Build & deploy → Build hooks → Add build hook**
   (name: `Admin content`, branch: `main`) → copy the URL.
2. Supabase SQL Editor → run (paste your URL):

```sql
insert into private.config (key, value)
values ('netlify_build_hook', 'https://api.netlify.com/build_hooks/XXXXXXXX')
on conflict (key) do update set value = excluded.value;
```

Every save in Plans / Offers / Reviews / Settings now triggers a Netlify build; the live site updates in about a minute.
The hook URL sits in a private schema the website can't read.

## Using the dashboard
- **Plans**: name, duration, price (empty = "Price on enquiry"), benefits (one per line), highlight badge, show/hide, order.
- **Offers**: title, % off, which plans (none = all), start and end dates. The banner and discounted prices appear only
  between those dates, checked again in each visitor's browser, so an offer switches off on time even without a rebuild.
- **Reviews**: add / edit / hide / delete, photo upload (auto-cropped to a small square WebP), gold highlight phrase,
  and the "Sample" flag (sample reviews are always labelled on the site).
- **Settings**: launch status (pre-booking soon → pre-booking open → now open, which changes every button label) and opening hours.

If Supabase is ever unreachable during a build, the site falls back to the built-in content in `src/data/`.

## Using the inbox
Open `/admin`, sign in. Each enquiry shows name, phone, interest and message, with:
status (New → Contacted → Visited → Joined → Closed), private notes, one-tap Call / WhatsApp, delete,
search, and **Export CSV** (opens in Excel / Google Sheets).

## Security model
- Visitors can only **insert** an enquiry (name, phone, interest, message, consent). They can never read enquiries.
- Visitors can read only *published* content (visible plans/reviews, enabled offers, settings); they can't change anything.
- Only users listed in `public.admins` can read, update or delete enquiries, or edit content and photos (row-level security).
- No passwords, payment details or ID numbers are stored.

## Free plan note
Free projects pause after ~1 week without activity. `.github/workflows/supabase-keepalive.yml` reads one row every 3 days
to keep it awake (GitHub → Actions tab → "Supabase keep-alive" → *Run workflow* to test it). GitHub pauses scheduled
workflows in repos with no commits for 60 days; re-enable it from the Actions tab if that happens. Or upgrade to Pro once the gym is busy.
