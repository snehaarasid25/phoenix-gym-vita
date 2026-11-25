import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from '../../../utils/supabase'

/** Admin-only Supabase client (auth + data). Loaded only on /admin. */
export const supabase = supabaseEnabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

export const field =
  'w-full rounded-xl border border-bone/12 bg-ash-950/60 px-4 py-3 text-base text-bone outline-none transition-colors placeholder:text-ash-400 focus:border-brand-400'
export const labelCls = 'mb-1.5 block font-mono text-[0.62rem] tracking-[0.16em] text-ash-400 uppercase'
export const LIVE_NOTE = 'Saved. The live site updates in about a minute.'
