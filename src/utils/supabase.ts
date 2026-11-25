/**
 * Supabase config (public values only: the URL and the anon/publishable key are designed to be public;
 * security is enforced by row-level security in the database, see supabase/migrations).
 * Optional overrides in `.env` / Netlify env vars: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY.
 * If Supabase is ever unreachable, the site still works: the enquiry form just opens WhatsApp as before.
 */
// Phoenix Gym's project. Both values are public by design (they ship to every visitor's browser);
// env vars can override them (e.g. a local Supabase for development).
const DEFAULT_URL = 'https://dmkjlgtbtlqyzykhjenw.supabase.co'
const DEFAULT_KEY = 'sb_publishable_PQPRLndIwE5J8UxkzLAgYg_w8uRF4w0'

export const SUPABASE_URL = ((import.meta.env.PUBLIC_SUPABASE_URL as string | undefined) || DEFAULT_URL).replace(/\/$/, '')
export const SUPABASE_ANON_KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_KEY
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Headers for the public REST API (new publishable keys aren't JWTs, so they go in `apikey` only). */
function publicHeaders(): Record<string, string> {
  const key = SUPABASE_ANON_KEY as string
  const h: Record<string, string> = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
  if (!key.startsWith('sb_')) h.Authorization = `Bearer ${key}`
  return h
}

export interface NewEnquiry {
  name: string
  phone: string
  interest?: string | null
  message?: string | null
  consent: true
}

/**
 * Save an enquiry. Uses `keepalive` so the request still completes when WhatsApp opens and the
 * page goes to the background. Never throws; resolves false when Supabase isn't configured or fails.
 */
export async function saveEnquiry(e: NewEnquiry): Promise<boolean> {
  if (!supabaseEnabled) return false
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: 'POST',
      keepalive: true,
      headers: publicHeaders(),
      body: JSON.stringify({
        name: e.name.trim().slice(0, 80),
        phone: e.phone.trim(),
        interest: e.interest?.trim().slice(0, 120) || null,
        message: e.message?.trim().slice(0, 1000) || null,
        consent: true,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
