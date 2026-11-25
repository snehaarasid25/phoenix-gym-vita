import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AddressBook, ArrowClockwise, CaretDown, Check, DownloadSimple, MagnifyingGlass, Phone, SignOut, Trash, WhatsappLogo, X } from '@phosphor-icons/react'
import { field, supabase } from './admin/client'
import { OffersEditor, PlansEditor, ReviewsEditor, SettingsEditor } from './admin/ContentEditors'
import { cn } from '../../utils/cn'
import { formatINR } from '../../utils/contact'
import { site } from '../../config/site'

const TABS = [
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'plans', label: 'Plans' },
  { id: 'offers', label: 'Offers' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'settings', label: 'Settings' },
] as const
type Tab = (typeof TABS)[number]['id']


const STATUSES = ['new', 'contacted', 'visited', 'joined', 'closed'] as const
type Status = (typeof STATUSES)[number]
const STATUS_LABEL: Record<Status, string> = { new: 'New', contacted: 'Contacted', visited: 'Visited', joined: 'Joined', closed: 'Closed' }
const STATUS_TONE: Record<Status, string> = {
  new: 'border-brand-400/60 bg-brand-500/15 text-brand-200',
  contacted: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  visited: 'border-violet-400/40 bg-violet-400/10 text-violet-200',
  joined: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  closed: 'border-bone/15 bg-bone/5 text-ash-300',
}

interface Enquiry {
  id: string
  created_at: string
  name: string
  phone: string
  interest: string | null
  message: string | null
  status: Status
  notes: string | null
}


/** Indian numbers without a country code get +91 for WhatsApp links. */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `91${d}` : d
}
interface PlanLite {
  name: string
  duration: string
  price: number | null
  price_note: string | null
}
const MAP_LINK = site.location.geo ? `https://maps.google.com/?q=${site.location.geo.lat},${site.location.geo.lng}` : site.location.mapsUrl
/** Ready-made WhatsApp replies, personalised with the enquiry's name, interest and the current plans. */
function replyTemplates(r: Enquiry, plans: PlanLite[]) {
  const first = firstName(r.name)
  const about = r.interest ? ` about ${r.interest}` : ''
  const priceLines = plans.map((p) => `• ${p.name} (${p.duration})${p.price !== null ? `: ${formatINR(p.price)}${p.price_note ? ` ${p.price_note}` : ''}` : ''}`).join('\n')
  return [
    { label: 'Hello', text: `Hi ${first}, this is Phoenix Gym Vita. Thanks for your enquiry${about}! How can we help you?` },
    {
      label: 'Send prices',
      text: `Hi ${first}, thanks for your interest in Phoenix Gym Vita! Here are our membership plans:\n\n${priceLines}\n\nWould you like to visit and see the gym?`,
    },
    { label: 'Invite for a visit', text: `Hi ${first}, we'd love to show you around Phoenix Gym Vita. When would suit you to drop by?\n\nLocation: ${MAP_LINK}` },
    { label: 'Follow-up', text: `Hi ${first}, just checking in from Phoenix Gym Vita about your enquiry${about}. Do you have any questions we can help with?` },
    { label: 'Welcome (joined)', text: `Hi ${first}, welcome to Phoenix Gym Vita! We're excited to have you with us. See you on the floor! 🔥` },
  ]
}
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const firstName = (name: string) => name.trim().split(/\s+/)[0]
const waLink = (r: Enquiry, text: string) => `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(text)}`

function download(filename: string, content: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
const today = () => new Date().toISOString().slice(0, 10)

/** Enquiries as phone contacts (.vcf), named "<Name> (Phoenix)" so they're easy to find for a WhatsApp broadcast list. */
function contactsFile(list: Enquiry[]) {
  const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, ' ')
  return list
    .map((r) =>
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${esc(r.name)} (Phoenix)`,
        `N:;${esc(r.name)} (Phoenix);;;`,
        `TEL;TYPE=CELL:+${waNumber(r.phone)}`,
        r.interest ? `NOTE:${esc(`Phoenix Gym enquiry: ${r.interest}`)}` : null,
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\r\n'),
    )
    .join('\r\n')
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase) // nothing to wait for when Supabase isn't configured
  // Admin check is remembered per user id, so it resets automatically on sign-out / account switch
  const [adminCheck, setAdminCheck] = useState<{ uid: string; ok: boolean } | null>(null)
  const uid = session?.user.id
  const isAdmin = uid && adminCheck?.uid === uid ? adminCheck.ok : null

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !uid) return
    supabase.rpc('is_admin').then(({ data }) => setAdminCheck({ uid, ok: Boolean(data) }))
  }, [uid])

  if (!supabase)
    return (
      <Shell>
        <Card>
          <h1 className="font-display text-3xl uppercase">Admin not connected</h1>
          <p className="mt-3 text-sm text-ash-300">
            Supabase isn't configured yet. Add <code>PUBLIC_SUPABASE_URL</code> and <code>PUBLIC_SUPABASE_ANON_KEY</code> to the environment.
          </p>
        </Card>
      </Shell>
    )
  if (!ready) return <Shell />
  if (!session) return <Login />
  if (isAdmin === null) return <Shell />
  if (!isAdmin)
    return (
      <Shell>
        <Card>
          <h1 className="font-display text-3xl uppercase">No access</h1>
          <p className="mt-3 text-sm text-ash-300">This account isn't an admin. Ask the site developer to grant access.</p>
          <button type="button" onClick={() => supabase!.auth.signOut()} className="mt-6 text-sm text-brand-300 underline underline-offset-4">
            Sign out
          </button>
        </Card>
      </Shell>
    )
  return <Dashboard email={session.user.email ?? ''} />
}

/* ── Layout bits ──────────────────────────────────────────────────────── */
function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-center gap-3">
        <img src="/brand/phoenix-emblem.png" alt="" width="171" height="218" className="h-9 w-auto" />
        <div>
          <p className="font-serif text-lg leading-none tracking-[0.12em] text-bone">PHOENIX</p>
          <p className="mt-1 font-mono text-[0.6rem] tracking-[0.2em] text-brand-300 uppercase">Admin</p>
        </div>
      </div>
      {children}
    </main>
  )
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card-lux rounded-[1.5rem] p-6 sm:p-8', className)}>{children}</div>
}

/* ── Login (+ password reset) ────────────────────────────────────────── */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setMsg('Email or password is incorrect.')
    setBusy(false)
  }
  const onReset = async () => {
    if (!email.trim()) return setMsg('Enter your email first, then tap “Forgot password”.')
    await supabase!.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` })
    setMsg('If that email has access, a reset link is on its way.')
  }

  return (
    <Shell>
      <Card className="mx-auto w-full max-w-md">
        <h1 className="font-display text-4xl leading-none uppercase">Sign in</h1>
        <p className="mt-2 text-sm text-ash-400">Owner access only.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          <input type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          <button type="submit" disabled={busy} className="btn-primary h-12 w-full rounded-full font-mono text-xs font-semibold tracking-[0.16em] uppercase disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <button type="button" onClick={onReset} className="mt-4 text-sm text-ash-400 underline underline-offset-4 hover:text-bone">
          Forgot password?
        </button>
        {msg && <p className="mt-4 text-sm text-brand-300" aria-live="polite">{msg}</p>}
      </Card>
    </Shell>
  )
}

/* ── Signed-in dashboard: tabs + toast ───────────────────────────────── */
function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>(() => {
    const h = window.location.hash.slice(1)
    return TABS.some((t) => t.id === h) ? (h as Tab) : 'enquiries'
  })
  const [toast, setToast] = useState<{ msg: string; error?: boolean; n: number } | null>(null)
  const notify = useCallback((msg: string, error?: boolean) => setToast((t) => ({ msg, error, n: (t?.n ?? 0) + 1 })), [])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), toast.error ? 7000 : 4000)
    return () => window.clearTimeout(id)
  }, [toast])
  const go = (t: Tab) => {
    setTab(t)
    history.replaceState(null, '', `#${t}`)
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="truncate text-sm text-ash-400">Signed in as {email}</p>
        <IconBtn label="Sign out" onClick={() => supabase!.auth.signOut()}>
          <SignOut className="size-4" weight="bold" />
        </IconBtn>
      </div>
      <nav className="no-scrollbar -mx-4 mb-8 flex gap-1 overflow-x-auto border-b border-bone/10 px-4 sm:mx-0 sm:px-0" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-4 py-3 font-mono text-[0.7rem] tracking-[0.14em] uppercase transition-colors',
              tab === t.id ? 'border-brand-400 text-brand-200' : 'border-transparent text-ash-400 hover:text-bone',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'enquiries' && <Inbox />}
      {tab !== 'enquiries' && <h1 className="mb-6 font-display text-4xl leading-none uppercase sm:text-5xl">{TABS.find((t) => t.id === tab)!.label}</h1>}
      {tab === 'plans' && <PlansEditor notify={notify} />}
      {tab === 'offers' && <OffersEditor notify={notify} />}
      {tab === 'reviews' && <ReviewsEditor notify={notify} />}
      {tab === 'settings' && <SettingsEditor notify={notify} />}
      {toast && (
        <p
          key={toast.n}
          role="status"
          className={cn(
            'fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md rounded-2xl border px-5 py-3.5 text-sm shadow-2xl backdrop-blur sm:inset-x-auto sm:right-6',
            toast.error ? 'border-red-400/50 bg-red-950/90 text-red-100' : 'border-brand-400/50 bg-ash-950/90 text-brand-100',
          )}
        >
          {toast.msg}
        </p>
      )}
    </Shell>
  )
}

/* ── Enquiries inbox ─────────────────────────────────────────────────── */
function Inbox() {
  const [rows, setRows] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [plans, setPlans] = useState<PlanLite[]>([])
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [selecting, setSelecting] = useState(false) // tick-boxes only show after tapping "Select"
  const [queue, setQueue] = useState<Enquiry[] | null>(null) // bulk WhatsApp sender, when open
  const [info, setInfo] = useState<string | null>(null)
  useEffect(() => {
    supabase!
      .from('plans')
      .select('name,duration,price,price_note')
      .eq('visible', true)
      .order('sort')
      .then(({ data }) => setPlans((data ?? []) as PlanLite[]))
  }, [])

  const query = () => supabase!.from('enquiries').select('*').order('created_at', { ascending: false }).limit(1000)
  const apply = useCallback(({ data, error }: { data: unknown; error: { message: string } | null }) => {
    if (error) setError(error.message)
    else {
      setRows((data ?? []) as Enquiry[])
      setError(null)
    }
    setLoading(false)
  }, [])
  // Initial load (state only changes in the promise callback; ignored if the inbox unmounts first)
  useEffect(() => {
    let alive = true
    query().then((res) => alive && apply(res))
    return () => {
      alive = false
    }
  }, [apply])
  const load = () => {
    setLoading(true)
    query().then(apply)
  }

  const update = async (id: string, patch: Partial<Pick<Enquiry, 'status' | 'notes'>>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    const { error } = await supabase!.from('enquiries').update(patch).eq('id', id)
    if (error) setError(error.message)
  }
  /** Calling or messaging a new lead moves it to "Contacted" automatically. */
  const markContacted = (r: Enquiry) => {
    if (r.status === 'new') update(r.id, { status: 'contacted' })
  }
  const remove = async (id: string) => {
    if (!window.confirm('Delete this enquiry permanently?')) return
    setRows((rs) => rs.filter((r) => r.id !== id))
    const { error } = await supabase!.from('enquiries').delete().eq('id', id)
    if (error) setError(error.message)
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length }
    for (const s of STATUSES) c[s] = rows.filter((r) => r.status === s).length
    return c
  }, [rows])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (filter === 'all' || r.status === filter) &&
        (!needle || [r.name, r.phone, r.interest, r.message, r.notes].some((v) => v?.toLowerCase().includes(needle))),
    )
  }, [rows, q, filter])

  const exportCsv = (list: Enquiry[] = shown) => {
    const head = ['Date', 'Name', 'Phone', 'Interested in', 'Message', 'Status', 'Notes']
    const esc = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`
    const lines = list.map((r) =>
      [new Date(r.created_at).toLocaleString('en-IN'), r.name, r.phone, r.interest, r.message, STATUS_LABEL[r.status], r.notes].map(esc).join(','),
    )
    download(`phoenix-enquiries-${today()}.csv`, '\ufeff' + [head.join(','), ...lines].join('\n'), 'text/csv;charset=utf-8')
  }

  /* ── Selection (for bulk replies / export) ── */
  const selectedRows = rows.filter((r) => selected.has(r.id))
  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.id))
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAllShown = () =>
    setSelected((s) => {
      const next = new Set(s)
      for (const r of shown) {
        if (allShownSelected) next.delete(r.id)
        else next.add(r.id)
      }
      return next
    })
  const clearSelection = () => setSelected(new Set())
  /** Leave select mode: hide the tick-boxes and forget the selection. */
  const stopSelecting = () => {
    setSelecting(false)
    clearSelection()
  }
  const saveContacts = () => {
    download(`phoenix-contacts-${today()}.vcf`, contactsFile(selectedRows), 'text/vcard;charset=utf-8')
    setInfo(
      `Saved ${selectedRows.length} contact${selectedRows.length === 1 ? '' : 's'}. Open the file on your phone to add them to Contacts, then in WhatsApp Business: Chats → ⋮ → New broadcast → pick them. Only people who have saved the gym's number receive broadcasts.`,
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl leading-none uppercase sm:text-5xl">Enquiries</h1>
        <div className="flex gap-2">
          <IconBtn label="Refresh" onClick={load}>
            <ArrowClockwise className={cn('size-4', loading && 'animate-spin')} weight="bold" />
          </IconBtn>
          <IconBtn label="Export CSV (Excel)" onClick={() => exportCsv()}>
            <DownloadSimple className="size-4" weight="bold" />
          </IconBtn>
        </div>
      </div>

      <div className="relative mt-6">
        <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ash-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, interest…" className={cn(field, 'pl-11')} />
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase transition-colors',
              filter === s ? 'border-brand-400 bg-brand-500/20 text-brand-200' : 'border-bone/12 text-ash-300 hover:border-bone/30',
            )}
          >
            {s === 'all' ? 'All' : STATUS_LABEL[s]} · {counts[s] ?? 0}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      {info && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
          <p className="flex-1 leading-relaxed">{info}</p>
          <button type="button" onClick={() => setInfo(null)} aria-label="Dismiss" className="shrink-0 text-brand-200 hover:text-bone">
            <X className="size-4" />
          </button>
        </div>
      )}

      {shown.length > 0 && (
        <div className="mt-6 flex min-h-10 items-center justify-between gap-3">
          {selecting ? (
            <>
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-brand-400/60 bg-brand-500/15 py-2 pr-4 pl-3 text-sm text-brand-100">
                <input type="checkbox" checked={allShownSelected} onChange={toggleAllShown} className="size-5 accent-[var(--color-brand-500)]" />
                Select all{shown.length !== rows.length ? ' shown' : ''} ({shown.length})
              </label>
              <button type="button" onClick={stopSelecting} className="rounded-full border border-bone/15 px-4 py-2 text-sm text-ash-300 hover:border-bone/30 hover:text-bone">
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelecting(true)}
              className="rounded-full border border-bone/15 px-5 py-2 font-mono text-[0.7rem] tracking-[0.14em] text-ash-200 uppercase transition-colors hover:border-brand-400 hover:text-brand-200"
            >
              Select
            </button>
          )}
        </div>
      )}

      <ul className={cn('mt-4 space-y-3', selected.size > 0 && 'pb-28')}>
        {!loading && shown.length === 0 && (
          <li className="rounded-2xl border border-dashed border-bone/15 p-8 text-center text-sm text-ash-400">No enquiries {q || filter !== 'all' ? 'match' : 'yet'}.</li>
        )}
        {shown.map((r) => (
          <li key={r.id} className={cn('card-lux rounded-2xl p-5', selected.has(r.id) && 'border-brand-400/60!')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <label className={cn('flex min-w-0 flex-1 items-start gap-3', selecting && 'cursor-pointer')}>
                {selecting && (
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    aria-label={`Select ${r.name}`}
                    className="mt-1.5 size-5 shrink-0 accent-[var(--color-brand-500)]"
                  />
                )}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-bone">{r.name}</p>
                <p className="mt-0.5 text-sm text-ash-400">
                  {fmtDate(r.created_at)}
                  {r.interest && <> · <span className="text-brand-300">{r.interest}</span></>}
                </p>
              </div>
              </label>
              <select
                value={r.status}
                onChange={(e) => update(r.id, { status: e.target.value as Status })}
                aria-label={`Status for ${r.name}`}
                className={cn('rounded-full border px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase outline-none', STATUS_TONE[r.status])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-ash-900 text-bone">
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {r.message && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ash-300">{r.message}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href={`tel:${r.phone}`} onClick={() => markContacted(r)} className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-3.5 py-2 text-sm text-bone hover:border-brand-400">
                <Phone className="size-4 text-brand-400" weight="fill" /> {r.phone}
              </a>
              <details className="group order-last w-full sm:order-none sm:w-auto">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-sm text-emerald-200 hover:border-emerald-300 [&::-webkit-details-marker]:hidden">
                  <WhatsappLogo className="size-4" weight="fill" /> WhatsApp
                  <CaretDown className="size-3.5 transition-transform group-open:rotate-180" weight="bold" />
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {replyTemplates(r, plans).map((t) => (
                    <a
                      key={t.label}
                      href={`https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(t.text)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t.text}
                      onClick={(e) => {
                        markContacted(r)
                        e.currentTarget.closest('details')?.removeAttribute('open')
                      }}
                      className="rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-100 hover:border-emerald-300 hover:bg-emerald-400/10"
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
              </details>
              <button type="button" onClick={() => remove(r.id)} aria-label={`Delete enquiry from ${r.name}`} className="ml-auto grid size-9 place-items-center rounded-full text-ash-400 hover:bg-red-500/10 hover:text-red-300">
                <Trash className="size-4" />
              </button>
            </div>

            <textarea
              defaultValue={r.notes ?? ''}
              onBlur={(e) => e.target.value !== (r.notes ?? '') && update(r.id, { notes: e.target.value || null })}
              placeholder="Private notes (saved when you tap outside)"
              rows={2}
              className={cn(field, 'mt-4 resize-y py-2.5 text-sm')}
            />
          </li>
        ))}
      </ul>

      {/* Bulk actions for the ticked enquiries */}
      {selected.size > 0 && (
        <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-3xl">
          <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-brand-400/40 bg-ash-900/95 p-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] sm:flex-nowrap sm:rounded-full sm:pl-5">
            <p className="mr-auto px-2 text-sm font-semibold text-bone sm:px-0">{selectedRows.length} selected</p>
            <button
              type="button"
              onClick={() => setQueue(selectedRows)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-ash-950 hover:bg-emerald-400 sm:flex-none"
            >
              <WhatsappLogo className="size-5" weight="fill" /> Send on WhatsApp
            </button>
            <button type="button" onClick={saveContacts} className="inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-sm text-bone hover:border-brand-400" title="Save as phone contacts (.vcf) for a WhatsApp Business broadcast">
              <AddressBook className="size-5" /> Contacts
            </button>
            <button type="button" onClick={() => exportCsv(selectedRows)} className="inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-sm text-bone hover:border-brand-400" title="Export the selected enquiries to CSV (Excel)">
              <DownloadSimple className="size-5" /> CSV
            </button>
            <button type="button" onClick={stopSelecting} aria-label="Cancel selection" className="grid size-11 place-items-center rounded-full text-ash-400 hover:text-bone">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      {queue && (
        <BulkSender
          list={queue}
          plans={plans}
          onSent={markContacted}
          onClose={(finished) => {
            setQueue(null)
            if (finished) stopSelecting()
          }}
        />
      )}
    </>
  )
}

/* ── Bulk WhatsApp sender: one personalised chat at a time (WhatsApp links can't send in the background) ── */
const CUSTOM_TEMPLATE = 'Custom message'
function BulkSender({ list, plans, onSent, onClose }: { list: Enquiry[]; plans: PlanLite[]; onSent: (r: Enquiry) => void; onClose: (finished: boolean) => void }) {
  const [template, setTemplate] = useState('Hello')
  const [custom, setCustom] = useState('Hi {name}, ')
  const [pos, setPos] = useState(0)
  const [done, setDone] = useState<Record<string, 'sent' | 'skipped'>>({})
  const current = list[pos]
  const finished = pos >= list.length
  const sentCount = Object.values(done).filter((d) => d === 'sent').length

  const messageFor = (r: Enquiry) =>
    template === CUSTOM_TEMPLATE ? custom.replaceAll('{name}', firstName(r.name)) : (replyTemplates(r, plans).find((t) => t.label === template)?.text ?? '')
  const mark = (r: Enquiry, d: 'sent' | 'skipped') => {
    setDone((m) => ({ ...m, [r.id]: d }))
    setPos((p) => p + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const templates = [...replyTemplates(list[0], plans).map((t) => t.label), CUSTOM_TEMPLATE]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ash-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-title">
      <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <div className="card-lux relative w-full max-w-xl rounded-[1.5rem] p-5 sm:p-7">
          <button type="button" onClick={() => onClose(finished)} aria-label="Close" className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-bone/15 text-bone hover:border-brand-400">
            <X className="size-5" />
          </button>
          <h2 id="bulk-title" className="pr-12 font-display text-3xl leading-none uppercase">Send on WhatsApp</h2>
          <p className="mt-2 text-sm text-ash-400">
            WhatsApp opens one chat at a time with the message ready. Tap <span className="text-bone">Send</span> there, come back, and the next one is ready.
          </p>

          {!finished ? (
            <>
              <p className="mt-5 mb-2 font-mono text-[0.62rem] tracking-[0.16em] text-ash-400 uppercase">Message</p>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition-colors',
                      template === t ? 'border-brand-400 bg-brand-500/20 text-brand-200' : 'border-bone/15 text-ash-300 hover:border-brand-400',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {template === CUSTOM_TEMPLATE && (
                <>
                  <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={4} className={cn(field, 'mt-3 resize-y text-sm')} aria-label="Custom message" />
                  <p className="mt-1.5 text-xs text-ash-400">
                    Write <span className="text-brand-300">{'{name}'}</span> where the person's first name should go.
                  </p>
                </>
              )}

              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <p className="min-w-0 truncate">
                  <span className="text-ash-400">
                    {pos + 1} of {list.length} ·
                  </span>{' '}
                  <span className="font-semibold text-bone">{current.name}</span> <span className="text-ash-400">{current.phone}</span>
                </p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-bone/10">
                <div className="h-full rounded-full bg-brand-400 transition-[width] duration-300" style={{ width: `${(pos / list.length) * 100}%` }} />
              </div>
              <p className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-bone/10 bg-ash-950/60 p-4 text-sm leading-relaxed whitespace-pre-line text-ash-200">{messageFor(current)}</p>

              <div className="mt-5 flex gap-2">
                <a
                  href={waLink(current, messageFor(current))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onSent(current)
                    mark(current, 'sent')
                  }}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-ash-950 hover:bg-emerald-400"
                >
                  <WhatsappLogo className="size-5" weight="fill" /> Open chat with {firstName(current.name)}
                </a>
                <button type="button" onClick={() => mark(current, 'skipped')} className="h-12 rounded-full border border-bone/20 px-5 text-sm text-bone hover:border-brand-400">
                  Skip
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <Check className="size-7" weight="bold" />
              </span>
              <p className="mt-4 text-lg font-semibold text-bone">All done</p>
              <p className="mt-1 text-sm text-ash-400">
                Opened {sentCount} chat{sentCount === 1 ? '' : 's'}
                {list.length - sentCount > 0 && `, skipped ${list.length - sentCount}`}. New enquiries you messaged are now marked Contacted.
              </p>
              <button type="button" onClick={() => onClose(true)} className="btn-primary mt-6 h-12 rounded-full px-8 font-mono text-xs font-semibold tracking-[0.14em] uppercase">
                Close
              </button>
            </div>
          )}

          {/* Everyone in this batch, with where they're at */}
          <ul className="mt-6 max-h-40 space-y-1 overflow-y-auto border-t border-bone/10 pt-4 text-sm">
            {list.map((r, i) => (
              <li key={r.id} className={cn('flex items-center justify-between gap-3', i === pos && !finished ? 'text-bone' : 'text-ash-400')}>
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-xs">
                  {done[r.id] === 'sent' ? <span className="text-emerald-300">Opened ✓</span> : done[r.id] === 'skipped' ? 'Skipped' : i === pos ? <span className="text-brand-300">Next</span> : 'Waiting'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-11 place-items-center rounded-full border border-bone/15 text-bone transition-colors hover:border-brand-400 hover:text-brand-300">
      {children}
    </button>
  )
}
