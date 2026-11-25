/**
 * Build-time content fetch: pulls the owner-editable content (settings, plans, offers, reviews) from Supabase
 * and writes src/data/remote.json, which the site reads while building. Uses only the public key, so it sees
 * exactly what visitors may see (row-level security). On any failure it writes `{}` and the build falls back
 * to the defaults in src/data/*.ts, so a Supabase hiccup can never break a deploy.
 */
import { writeFileSync } from 'node:fs'

const URL = (process.env.PUBLIC_SUPABASE_URL || 'https://dmkjlgtbtlqyzykhjenw.supabase.co').replace(/\/$/, '')
const KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PQPRLndIwE5J8UxkzLAgYg_w8uRF4w0'
const OUT = new globalThis.URL('../src/data/remote.json', import.meta.url)

const headers = { apikey: KEY, ...(KEY.startsWith('sb_') ? {} : { Authorization: `Bearer ${KEY}` }) }
const get = async (path) => {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

const today = new Date().toISOString().slice(0, 10)
try {
  const [settings, plans, offers, reviews] = await Promise.all([
    get('site_settings?select=launch_status,hours&id=eq.1'),
    get('plans?select=*&visible=eq.true&order=sort.asc,name.asc'),
    get(`offers?select=*&active=eq.true&ends_on=gte.${today}&order=starts_on.asc`),
    get('reviews?select=*&visible=eq.true&order=sort.asc,created_at.asc'),
  ])
  const data = { fetchedAt: new Date().toISOString(), settings: settings[0] ?? null, plans, offers, reviews }
  writeFileSync(OUT, JSON.stringify(data, null, 2))
  console.log(`[content] Supabase: ${plans.length} plans, ${offers.length} offers, ${reviews.length} reviews, status=${data.settings?.launch_status}`)
} catch (err) {
  writeFileSync(OUT, '{}')
  console.warn(`[content] Supabase unavailable (${err.message}); using built-in defaults`)
}
