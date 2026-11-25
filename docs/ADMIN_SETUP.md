# Admin + enquiries: connecting Supabase

Stage 1 stores every website enquiry and gives the owner a private inbox at **/admin**.
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

## Using the inbox
Open `/admin`, sign in. Each enquiry shows name, phone, interest and message, with:
status (New → Contacted → Visited → Joined → Closed), private notes, one-tap Call / WhatsApp, delete,
search, and **Export CSV** (opens in Excel / Google Sheets).

## Security model
- Visitors can only **insert** an enquiry (name, phone, interest, message, consent). They can never read anything.
- Only users listed in `public.admins` can read, update or delete enquiries (row-level security).
- No passwords, payment details or ID numbers are stored.

## Free plan note
Free projects pause after ~1 week without activity. A scheduled weekly "ping" keeps it awake (added in a later stage),
or upgrade to Pro once the gym is busy.
