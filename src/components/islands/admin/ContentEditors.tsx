import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Camera, Plus, Trash } from '@phosphor-icons/react'
import { field, labelCls, LIVE_NOTE, supabase } from './client'
import { cn } from '../../../utils/cn'

/* ── Shared bits ──────────────────────────────────────────────────────── */
type Notify = (msg: string, error?: boolean) => void

/** Load a whole table (admins see hidden rows too); state only changes in the promise callback. */
function useTable<T>(table: string, order: string, notify: Notify) {
  const [rows, setRows] = useState<T[] | null>(null)
  const reload = useCallback(() => {
    supabase!
      .from(table)
      .select('*')
      .order(order, { ascending: true })
      .then(({ data, error }) => {
        if (error) notify(error.message, true)
        else setRows((data ?? []) as T[])
      })
  }, [table, order, notify])
  useEffect(() => {
    reload()
  }, [reload])
  return [rows, setRows, reload] as const
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card-lux rounded-2xl p-5 sm:p-6', className)}>{children}</div>
}
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  )
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ash-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--color-brand-500)]" />
      {label}
    </label>
  )
}
function SaveBtn({ onClick, busy, children = 'Save' }: { onClick: () => void; busy?: boolean; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn-primary h-11 rounded-full px-6 font-mono text-xs font-semibold tracking-[0.14em] uppercase disabled:opacity-60">
      {busy ? 'Saving…' : children}
    </button>
  )
}
function DeleteBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-10 place-items-center rounded-full text-ash-400 hover:bg-red-500/10 hover:text-red-300">
      <Trash className="size-4" />
    </button>
  )
}
function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-11 items-center gap-2 rounded-full border border-brand-500/50 px-5 font-mono text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase hover:border-brand-400 hover:bg-brand-500/10">
      <Plus className="size-4" weight="bold" /> {children}
    </button>
  )
}
const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD (local)
const addDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

const CUSTOM = '__custom'
/** Dropdown of presets with a "Custom…" option that reveals a free-text box. */
function PresetSelect({ value, options, onChange, placeholder }: { value: string; options: readonly string[]; onChange: (v: string) => void; placeholder?: string }) {
  const [forceCustom, setForceCustom] = useState(false)
  const showCustom = forceCustom || (value !== '' && !options.includes(value))
  return (
    <>
      <select
        className={field}
        value={showCustom ? CUSTOM : value}
        onChange={(e) => {
          if (e.target.value === CUSTOM) return setForceCustom(true)
          setForceCustom(false)
          onChange(e.target.value)
        }}
      >
        {value === '' && !showCustom && (
          <option value="" disabled>
            Choose…
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o} className="bg-ash-900">
            {o}
          </option>
        ))}
        <option value={CUSTOM} className="bg-ash-900">
          Custom…
        </option>
      </select>
      {showCustom && <input aria-label={placeholder} className={cn(field, 'mt-2')} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </>
  )
}
function Chip({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs transition-colors',
        active ? 'border-brand-400 bg-brand-500/20 text-brand-200' : 'border-bone/15 text-ash-300 hover:border-brand-400 hover:text-bone',
      )}
    >
      {children}
    </button>
  )
}

/* ── Plans ────────────────────────────────────────────────────────────── */
interface PlanRow {
  id: string
  sort: number
  name: string
  duration: string
  price: number | null
  price_note: string | null
  benefits: string[]
  highlight: boolean
  highlight_label: string | null
  visible: boolean
  _new?: boolean
}
const DURATIONS = [
  { duration: '1 Month', name: 'Monthly' },
  { duration: '3 Months', name: 'Quarterly' },
  { duration: '6 Months', name: 'Half-Yearly' },
  { duration: '12 Months', name: 'Annual' },
] as const
const BENEFIT_IDEAS = [
  'Full gym floor access',
  'Strength & cardio zones',
  'HYROX training zone',
  'Steam bath access',
  'Yoga & mobility area',
  'Trainer guidance',
  'Diet guidance',
  'Locker access',
  'Progress check-ins',
  'Orientation on first visit',
]
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function PlansEditor({ notify }: { notify: Notify }) {
  const [rows, setRows, reload] = useTable<PlanRow>('plans', 'sort', notify)
  const [busy, setBusy] = useState<string | null>(null)
  const patch = (id: string, p: Partial<PlanRow>) => setRows((rs) => rs!.map((r) => (r.id === id ? { ...r, ...p } : r)))

  const save = async (r: PlanRow) => {
    const id = r._new ? slug(r.name) : r.id
    if (!id || !r.name.trim() || !r.duration.trim()) return notify('Name and duration are required.', true)
    setBusy(r.id)
    // Only one featured plan: un-feature the others first
    if (r.highlight) {
      const { error } = await supabase!.from('plans').update({ highlight: false }).neq('id', id).eq('highlight', true)
      if (error) {
        setBusy(null)
        return notify(error.message, true)
      }
    }
    const { _new: _, ...row } = { ...r, id, benefits: r.benefits.map((b) => b.trim()).filter(Boolean) }
    const { error } = await supabase!.from('plans').upsert(row)
    setBusy(null)
    if (error) notify(error.message, true)
    else {
      notify(LIVE_NOTE)
      reload()
    }
  }
  const remove = async (r: PlanRow) => {
    if (r._new) return setRows((rs) => rs!.filter((x) => x.id !== r.id))
    if (!window.confirm(`Delete the ${r.name} plan? (Tip: untick “Show on website” to hide it instead.)`)) return
    const { error } = await supabase!.from('plans').delete().eq('id', r.id)
    if (error) notify(error.message, true)
    else {
      notify(LIVE_NOTE)
      reload()
    }
  }
  const move = async (i: number, dir: -1 | 1) => {
    const list = rows!
    const j = i + dir
    if (j < 0 || j >= list.length || list[i]._new || list[j]._new) return
    const a = list[i]
    const b = list[j]
    const { error } = await supabase!.from('plans').upsert([
      { id: a.id, name: a.name, duration: a.duration, sort: b.sort === a.sort ? a.sort + dir : b.sort },
      { id: b.id, name: b.name, duration: b.duration, sort: a.sort },
    ])
    if (error) notify(error.message, true)
    else reload()
  }
  const add = () =>
    setRows((rs) => [
      ...(rs ?? []),
      { id: `new-${Date.now()}`, sort: (rs?.at(-1)?.sort ?? 0) + 1, name: '', duration: '', price: null, price_note: null, benefits: [], highlight: false, highlight_label: null, visible: true, _new: true },
    ])

  if (!rows) return <p className="text-sm text-ash-400">Loading…</p>
  return (
    <div className="space-y-4">
      <p className="text-sm text-ash-400">Leave the price empty to show “Price on enquiry”. Benefits: one per line.</p>
      {rows.map((r, i) => (
        <Panel key={r.id}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration">
              <PresetSelect
                value={r.duration}
                options={DURATIONS.map((d) => d.duration)}
                placeholder="e.g. 2 Months"
                onChange={(v) => {
                  const preset = DURATIONS.find((d) => d.duration === v)
                  // Fill the name too, unless the owner typed their own
                  const autoName = preset && (!r.name || DURATIONS.some((d) => d.name === r.name))
                  patch(r.id, { duration: v, ...(autoName ? { name: preset.name } : {}) })
                }}
              />
            </Field>
            <Field label="Plan name">
              <input className={field} value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} placeholder="e.g. Annual" />
            </Field>
            <Field label="Price (₹)">
              <input
                className={field}
                inputMode="numeric"
                value={r.price ?? ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  patch(r.id, { price: v ? Number(v) : null })
                }}
                placeholder="Empty = Price on enquiry"
              />
            </Field>
            <Field label="Price note">
              <input className={field} value={r.price_note ?? ''} onChange={(e) => patch(r.id, { price_note: e.target.value || null })} placeholder="e.g. / month" />
            </Field>
            <Field label="Benefits (one per line)" className="sm:col-span-2">
              <textarea className={cn(field, 'resize-y')} rows={4} value={r.benefits.join('\n')} onChange={(e) => patch(r.id, { benefits: e.target.value.split('\n') })} />
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-ash-400">Tap to add:</p>
              <div className="flex flex-wrap gap-2">
                {BENEFIT_IDEAS.filter((b) => !r.benefits.some((x) => x.trim().toLowerCase() === b.toLowerCase())).map((b) => (
                  <Chip key={b} onClick={() => patch(r.id, { benefits: [...r.benefits.filter((x) => x.trim()), b] })}>
                    + {b}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Toggle checked={r.visible} onChange={(v) => patch(r.id, { visible: v })} label="Show on website" />
            <Toggle
              checked={r.highlight}
              label="Highlight this plan (only one)"
              onChange={(v) =>
                setRows((rs) =>
                  rs!.map((x) => (x.id === r.id ? { ...x, highlight: v, highlight_label: v ? (x.highlight_label ?? 'Best value') : x.highlight_label } : v ? { ...x, highlight: false } : x)),
                )
              }
            />
            {r.highlight && (
              <div className="w-full max-w-xs">
                <PresetSelect
                  value={r.highlight_label ?? ''}
                  options={['Best value', 'Most popular', 'Recommended', 'Full-year commitment']}
                  onChange={(v) => patch(r.id, { highlight_label: v || null })}
                  placeholder="Badge text"
                />
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <SaveBtn onClick={() => save(r)} busy={busy === r.id} />
            {!r._new && (
              <>
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="grid size-10 place-items-center rounded-full border border-bone/15 text-ash-300 hover:border-brand-400">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="grid size-10 place-items-center rounded-full border border-bone/15 text-ash-300 hover:border-brand-400">
                  <ArrowDown className="size-4" />
                </button>
              </>
            )}
            <span className="ml-auto">
              <DeleteBtn onClick={() => remove(r)} label={`Delete ${r.name || 'plan'}`} />
            </span>
          </div>
        </Panel>
      ))}
      <AddBtn onClick={add}>Add plan</AddBtn>
    </div>
  )
}

/* ── Offers ───────────────────────────────────────────────────────────── */
interface OfferRow {
  id: string
  title: string
  description: string | null
  discount_percent: number | null
  plan_ids: string[]
  starts_on: string
  ends_on: string
  active: boolean
  _new?: boolean
}
const OCCASIONS = [
  { title: 'Launch offer', description: 'Pre-book before we open and save on your membership.' },
  { title: 'Diwali offer', description: 'Celebrate Diwali with a stronger you. Festive savings on memberships.' },
  { title: 'Navratri offer', description: 'Nine nights of celebration, a lifetime of strength. Navratri savings on memberships.' },
  { title: 'Dussehra offer', description: 'Win over your excuses this Dussehra. Special savings on memberships.' },
  { title: 'New Year offer', description: 'New year, stronger you. Start the year with savings on your membership.' },
  { title: 'Republic Day offer', description: 'Celebrate Republic Day with savings on memberships.' },
  { title: 'Holi offer', description: 'Add some colour to your fitness. Holi savings on memberships.' },
  { title: "Women's Day offer", description: "Celebrating strong women. Special Women's Day savings on memberships." },
  { title: 'Summer offer', description: 'Get summer-ready with savings on memberships.' },
  { title: 'Independence Day offer', description: 'Freedom to be your strongest. Independence Day savings on memberships.' },
  { title: 'Ganesh Chaturthi offer', description: 'Begin something new this Ganesh Chaturthi, with festive savings on memberships.' },
  { title: 'Christmas offer', description: 'Gift yourself strength this Christmas. Festive savings on memberships.' },
]
const DISCOUNTS = [5, 10, 15, 20, 25, 30, 50]
/** Quick date ranges, starting today (or the offer's future start date). */
const RANGES: { label: string; range: (start: string) => [string, string] }[] = [
  { label: '1 week', range: (s) => [s, addDays(s, 6)] },
  { label: '2 weeks', range: (s) => [s, addDays(s, 13)] },
  {
    label: 'Till month end',
    range: (s) => {
      const [y, m] = s.split('-').map(Number)
      return [s, new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)]
    },
  },
  {
    label: 'This weekend',
    range: () => {
      const t = today()
      const dow = new Date(`${t}T00:00:00Z`).getUTCDay()
      if (dow === 0) return [t, t]
      const sat = addDays(t, 6 - dow)
      return [sat, addDays(sat, 1)]
    },
  },
]

const offerState = (o: OfferRow) => {
  const t = today()
  if (!o.active) return { label: 'Off', tone: 'border-bone/15 text-ash-400' }
  if (t < o.starts_on) return { label: 'Upcoming', tone: 'border-sky-400/40 text-sky-200' }
  if (t > o.ends_on) return { label: 'Ended', tone: 'border-bone/15 text-ash-400' }
  return { label: 'Live', tone: 'border-emerald-400/50 text-emerald-200' }
}

export function OffersEditor({ notify }: { notify: Notify }) {
  const [rows, setRows, reload] = useTable<OfferRow>('offers', 'starts_on', notify)
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  useEffect(() => {
    supabase!
      .from('plans')
      .select('id,name')
      .order('sort')
      .then(({ data }) => setPlans(data ?? []))
  }, [])
  const patch = (id: string, p: Partial<OfferRow>) => setRows((rs) => rs!.map((r) => (r.id === id ? { ...r, ...p } : r)))

  const save = async (r: OfferRow) => {
    if (!r.title.trim()) return notify('Give the offer a title.', true)
    if (r.ends_on < r.starts_on) return notify('The end date must be on or after the start date.', true)
    setBusy(r.id)
    const { _new, id, ...rest } = r
    const { error } = _new ? await supabase!.from('offers').insert(rest) : await supabase!.from('offers').update(rest).eq('id', id)
    setBusy(null)
    if (error) notify(error.message, true)
    else {
      notify(LIVE_NOTE)
      reload()
    }
  }
  const remove = async (r: OfferRow) => {
    if (r._new) return setRows((rs) => rs!.filter((x) => x.id !== r.id))
    if (!window.confirm(`Delete “${r.title}”?`)) return
    const { error } = await supabase!.from('offers').delete().eq('id', r.id)
    if (error) notify(error.message, true)
    else {
      notify(LIVE_NOTE)
      reload()
    }
  }
  const add = () =>
    setRows((rs) => [{ id: `new-${Date.now()}`, title: '', description: null, discount_percent: 10, plan_ids: [], starts_on: today(), ends_on: addDays(today(), 6), active: true, _new: true }, ...(rs ?? [])])

  if (!rows) return <p className="text-sm text-ash-400">Loading…</p>
  return (
    <div className="space-y-4">
      <p className="text-sm text-ash-400">Offers appear on the website only between their start and end dates (inclusive), then switch off by themselves.</p>
      <AddBtn onClick={add}>New offer</AddBtn>
      {rows.length === 0 && <p className="rounded-2xl border border-dashed border-bone/15 p-6 text-center text-sm text-ash-400">No offers yet.</p>}
      {rows.map((r) => {
        const st = offerState(r)
        return (
          <Panel key={r.id}>
            {!r._new && <span className={cn('mb-4 inline-block rounded-full border px-3 py-1 font-mono text-[0.62rem] tracking-[0.14em] uppercase', st.tone)}>{st.label}</span>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Occasion">
                <PresetSelect
                  value={r.title}
                  options={OCCASIONS.map((o) => o.title)}
                  placeholder="Offer title, e.g. Anniversary offer"
                  onChange={(v) => {
                    const preset = OCCASIONS.find((o) => o.title === v)
                    // Suggest the matching description unless the owner wrote their own
                    const autoDesc = preset && (!r.description || OCCASIONS.some((o) => o.description === r.description))
                    patch(r.id, { title: v, ...(autoDesc ? { description: preset.description } : {}) })
                  }}
                />
              </Field>
              <div>
              <Field label="Discount (%)">
                <input
                  className={field}
                  inputMode="numeric"
                  value={r.discount_percent ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                    patch(r.id, { discount_percent: v ? Number(v) : null })
                  }}
                  placeholder="e.g. 20 (empty = no % shown)"
                />
              </Field>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {DISCOUNTS.map((d) => (
                    <Chip key={d} active={r.discount_percent === d} onClick={() => patch(r.id, { discount_percent: d })}>
                      {d}%
                    </Chip>
                  ))}
                </span>
              </div>
              <Field label="Starts on">
                <input
                  type="date"
                  className={field}
                  value={r.starts_on}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v) patch(r.id, { starts_on: v, ...(r.ends_on < v ? { ends_on: addDays(v, 6) } : {}) })
                  }}
                />
              </Field>
              <Field label="Ends on">
                <input type="date" className={field} value={r.ends_on} onChange={(e) => e.target.value && patch(r.id, { ends_on: e.target.value })} />
              </Field>
              <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2">
                <span className="mr-1 text-xs text-ash-400">Quick dates:</span>
                {RANGES.map(({ label, range }) => (
                  <Chip
                    key={label}
                    onClick={() => {
                      const [starts_on, ends_on] = range(r.starts_on > today() ? r.starts_on : today())
                      patch(r.id, { starts_on, ends_on })
                    }}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <Field label="Short description (optional)" className="sm:col-span-2">
                <input className={field} value={r.description ?? ''} onChange={(e) => patch(r.id, { description: e.target.value || null })} placeholder="e.g. Join before 15 Nov and save on your first year." />
              </Field>
            </div>
            <fieldset className="mt-4">
              <legend className={labelCls}>Applies to (none ticked = all plans)</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {plans.map((p) => (
                  <Toggle
                    key={p.id}
                    checked={r.plan_ids.includes(p.id)}
                    onChange={(v) => patch(r.id, { plan_ids: v ? [...r.plan_ids, p.id] : r.plan_ids.filter((x) => x !== p.id) })}
                    label={p.name}
                  />
                ))}
              </div>
            </fieldset>
            <div className="mt-4">
              <Toggle checked={r.active} onChange={(v) => patch(r.id, { active: v })} label="Enabled" />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <SaveBtn onClick={() => save(r)} busy={busy === r.id} />
              <span className="ml-auto">
                <DeleteBtn onClick={() => remove(r)} label={`Delete ${r.title || 'offer'}`} />
              </span>
            </div>
          </Panel>
        )
      })}
    </div>
  )
}

/* ── Reviews ──────────────────────────────────────────────────────────── */
interface ReviewRow {
  id: string
  sort: number
  name: string
  detail: string
  quote: string
  highlight: string | null
  photo_url: string | null
  is_sample: boolean
  visible: boolean
  _new?: boolean
}

/** Square-crop + resize a photo to 320px WebP in the browser (small, fast, privacy-friendly: no EXIF). */
async function toAvatar(file: File): Promise<Blob> {
  const img = await createImageBitmap(file)
  const side = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 320
  canvas.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 3, side, side, 0, 0, 320, 320)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/webp', 0.85))
}

const REVIEWER_LINES = ['Member', 'Pre-booked member', `Member since ${new Date().getFullYear()}`, 'HYROX athlete', 'Yoga member', 'Personal training client']

export function ReviewsEditor({ notify }: { notify: Notify }) {
  const [rows, setRows, reload] = useTable<ReviewRow>('reviews', 'sort', notify)
  const [busy, setBusy] = useState<string | null>(null)
  const quoteEls = useRef<Record<string, HTMLTextAreaElement | null>>({})
  /** Gold phrase = whatever the owner selected in the review text (selection survives the button tap). */
  const takeSelection = (r: ReviewRow) => {
    const el = quoteEls.current[r.id]
    const sel = el ? el.value.slice(el.selectionStart, el.selectionEnd).trim() : ''
    if (!sel) return notify('First select (highlight) a few words in the review, then tap “Use selected text”.', true)
    if (sel.length > 120) return notify('That selection is too long for the gold phrase (max 120 characters).', true)
    patch(r.id, { highlight: sel })
  }
  const patch = (id: string, p: Partial<ReviewRow>) => setRows((rs) => rs!.map((r) => (r.id === id ? { ...r, ...p } : r)))

  const upload = async (r: ReviewRow, file?: File) => {
    if (!file) return
    setBusy(r.id)
    try {
      const blob = await toAvatar(file)
      const path = `${crypto.randomUUID()}.webp`
      const { error } = await supabase!.storage.from('review-photos').upload(path, blob, { contentType: 'image/webp' })
      if (error) throw error
      patch(r.id, { photo_url: supabase!.storage.from('review-photos').getPublicUrl(path).data.publicUrl })
      notify('Photo ready. Tap Save to publish it.')
    } catch (e) {
      notify((e as Error).message, true)
    }
    setBusy(null)
  }
  const save = async (r: ReviewRow) => {
    if (!r.name.trim() || !r.quote.trim()) return notify('Name and review text are required.', true)
    if (r.highlight && !r.quote.includes(r.highlight)) return notify('The gold phrase must be copied exactly from the review text.', true)
    setBusy(r.id)
    const { _new, id, ...rest } = r
    const { error } = _new ? await supabase!.from('reviews').insert(rest) : await supabase!.from('reviews').update(rest).eq('id', id)
    setBusy(null)
    if (error) notify(error.message, true)
    else {
      notify(LIVE_NOTE)
      reload()
    }
  }
  const remove = async (r: ReviewRow) => {
    if (r._new) return setRows((rs) => rs!.filter((x) => x.id !== r.id))
    if (!window.confirm(`Delete the review from ${r.name}?`)) return
    const { error } = await supabase!.from('reviews').delete().eq('id', r.id)
    if (error) return notify(error.message, true)
    const stored = r.photo_url?.split('/review-photos/')[1]
    if (stored) await supabase!.storage.from('review-photos').remove([stored])
    notify(LIVE_NOTE)
    reload()
  }
  const add = () =>
    setRows((rs) => [
      ...(rs ?? []),
      { id: `new-${Date.now()}`, sort: (rs?.at(-1)?.sort ?? 0) + 1, name: '', detail: 'Member', quote: '', highlight: null, photo_url: null, is_sample: false, visible: true, _new: true },
    ])

  if (!rows) return <p className="text-sm text-ash-400">Loading…</p>
  return (
    <div className="space-y-4">
      <p className="text-sm text-ash-400">Only publish real reviews, with the person’s permission. Sample reviews are always labelled on the website; untick “Show on website” or delete them once you have real ones.</p>
      {rows.map((r) => (
        <Panel key={r.id}>
          <div className="flex items-start gap-4">
            <label className="relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-brand-500/40 bg-ash-950/60 text-brand-300" title="Upload photo">
              {r.photo_url ? <img src={r.photo_url} alt="" className="size-full object-cover" /> : <Camera className="size-6" />}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(r, e.target.files?.[0])} />
            </label>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={field} value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} placeholder="e.g. Rahul P." />
              </Field>
              <Field label="Line under the name">
                <PresetSelect value={r.detail} options={REVIEWER_LINES} onChange={(v) => patch(r.id, { detail: v })} placeholder="e.g. Morning batch regular" />
              </Field>
            </div>
          </div>
          <Field label="Review" className="mt-4">
            <textarea
              ref={(el) => {
                quoteEls.current[r.id] = el
              }}
              className={cn(field, 'resize-y')}
              rows={4}
              maxLength={600}
              value={r.quote}
              onChange={(e) => patch(r.id, { quote: e.target.value })}
            />
          </Field>
          <div className="mt-4">
            <p className={labelCls}>Phrase to show in gold (optional)</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                aria-label="Phrase to show in gold"
                className={cn(field, r.highlight && !r.quote.includes(r.highlight) && 'border-red-400/60')}
                value={r.highlight ?? ''}
                onChange={(e) => patch(r.id, { highlight: e.target.value || null })}
                placeholder="Select words in the review above, then tap the button"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault() /* keep the textarea selection */}
                onClick={() => takeSelection(r)}
                className="h-12 shrink-0 rounded-full border border-brand-500/50 px-5 font-mono text-xs font-semibold tracking-[0.12em] text-brand-300 uppercase hover:border-brand-400 hover:bg-brand-500/10"
              >
                Use selected text
              </button>
            </div>
            {r.highlight && !r.quote.includes(r.highlight) && <p className="mt-1.5 text-xs text-red-300">This phrase isn’t in the review text, so it won’t show in gold.</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            <Toggle checked={r.visible} onChange={(v) => patch(r.id, { visible: v })} label="Show on website" />
            <Toggle checked={r.is_sample} onChange={(v) => patch(r.id, { is_sample: v })} label="Sample (labelled “not a real review”)" />
            {r.photo_url && (
              <button type="button" onClick={() => patch(r.id, { photo_url: null })} className="text-sm text-ash-400 underline underline-offset-4 hover:text-bone">
                Remove photo
              </button>
            )}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <SaveBtn onClick={() => save(r)} busy={busy === r.id} />
            <span className="ml-auto">
              <DeleteBtn onClick={() => remove(r)} label={`Delete review from ${r.name || 'new review'}`} />
            </span>
          </div>
        </Panel>
      ))}
      <AddBtn onClick={add}>Add review</AddBtn>
    </div>
  )
}

/* ── Settings: launch status + opening hours ─────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'prebooking-soon', label: 'Pre-booking starting soon', hint: 'Buttons say “Get Early Access”' },
  { value: 'prebooking-open', label: 'Pre-booking now open', hint: 'Buttons say “Pre-book Your Spot”' },
  { value: 'open', label: 'Now open', hint: 'Buttons say “Join Phoenix”' },
] as const

const DAY_SETS = ['Mon – Sat', 'Mon – Fri', 'Saturday', 'Sunday', 'Daily', 'Weekends']
/** "Mon-Sat" / "mon - sat" → the matching preset "Mon – Sat" (else unchanged). */
const matchDays = (d: string) => DAY_SETS.find((x) => x.replace(/[\s–-]/g, '').toLowerCase() === d.replace(/[\s–—-]/g, '').toLowerCase()) ?? d
/** "5:30 AM" → "05:30" (for <input type=time>), and back. */
const to24 = (t: string) => {
  const m = t.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*([AP])\.?\s?M\.?$/i) // "5:30 AM", "10 PM", "6.00 a.m."
  if (!m || Number(m[1]) > 12) return null
  const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'P' ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`
}
const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
const splitHours = (s: string) => {
  const [a, b, extra] = s.split(/\s*[–—-]\s*/)
  const open = a && to24(a)
  const close = b && to24(b)
  return open && close && !extra ? { open, close } : null
}

export function SettingsEditor({ notify }: { notify: Notify }) {
  const [status, setStatus] = useState<string | null>(null)
  const [hours, setHours] = useState<{ days: string; hours: string }[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    supabase!
      .from('site_settings')
      .select('launch_status,hours')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (error) return notify(error.message, true)
        setStatus(data.launch_status)
        setHours(((data.hours ?? []) as { days?: string; hours?: string }[]).map((h) => ({ days: matchDays(h.days ?? ''), hours: h.hours || '5:30 AM – 10:00 PM' })))
      })
  }, [notify])

  const save = async () => {
    setBusy(true)
    const clean = hours.map((h) => ({ days: h.days.trim(), hours: h.hours.trim() })).filter((h) => h.days && h.hours)
    const { error } = await supabase!.from('site_settings').update({ launch_status: status, hours: clean.length ? clean : null, updated_at: new Date().toISOString() }).eq('id', 1)
    setBusy(false)
    if (error) notify(error.message, true)
    else notify(LIVE_NOTE)
  }

  if (!status) return <p className="text-sm text-ash-400">Loading…</p>
  return (
    <div className="space-y-4">
      <Panel>
        <p className={labelCls}>Launch status</p>
        <div className="mt-2 space-y-2">
          {STATUS_OPTIONS.map((o) => (
            <label key={o.value} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors', status === o.value ? 'border-brand-400 bg-brand-500/10' : 'border-bone/10 hover:border-bone/25')}>
              <input type="radio" name="status" checked={status === o.value} onChange={() => setStatus(o.value)} className="mt-1 accent-[var(--color-brand-500)]" />
              <span>
                <span className="block font-semibold text-bone">{o.label}</span>
                <span className="block text-sm text-ash-400">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </Panel>
      <Panel>
        <p className={labelCls}>Opening hours</p>
        <p className="mb-3 text-sm text-ash-400">Leave empty to show “Timings announced soon”.</p>
        <div className="space-y-2">
          {hours.map((h, i) => {
            const set = (p: Partial<{ days: string; hours: string }>) => setHours((hs) => hs.map((x, j) => (j === i ? { ...x, ...p } : x)))
            const closed = h.hours.trim().toLowerCase() === 'closed'
            const times = splitHours(h.hours) ?? { open: '05:30', close: '22:00' }
            const parsed = closed || !h.hours.trim() || splitHours(h.hours)
            return (
              <div key={i} className="rounded-xl border border-bone/10 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <PresetSelect value={h.days} options={DAY_SETS} onChange={(v) => set({ days: v })} placeholder="e.g. Tue – Sun" />
                  </div>
                  <DeleteBtn onClick={() => setHours((hs) => hs.filter((_, j) => j !== i))} label="Remove row" />
                </div>
                {parsed ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="time" aria-label="Opens" disabled={closed} className={cn(field, 'w-auto flex-1 disabled:opacity-40')} value={times.open} onChange={(e) => e.target.value && set({ hours: `${to12(e.target.value)} – ${to12(times.close)}` })} />
                    <span className="text-ash-400">to</span>
                    <input type="time" aria-label="Closes" disabled={closed} className={cn(field, 'w-auto flex-1 disabled:opacity-40')} value={times.close} onChange={(e) => e.target.value && set({ hours: `${to12(times.open)} – ${to12(e.target.value)}` })} />
                    <Toggle checked={closed} onChange={(v) => set({ hours: v ? 'Closed' : `${to12(times.open)} – ${to12(times.close)}` })} label="Closed" />
                  </div>
                ) : (
                  <input className={cn(field, 'mt-2')} value={h.hours} onChange={(e) => set({ hours: e.target.value })} aria-label="Hours" />
                )}
                <p className="mt-2 text-xs text-ash-400">Shows as: <span className="text-bone">{h.days || '…'} · {h.hours || '…'}</span></p>
              </div>
            )
          })}
        </div>
        <div className="mt-3">
          <AddBtn onClick={() => setHours((hs) => [...hs, hs.length ? { days: 'Sunday', hours: '6:00 AM – 12:00 PM' } : { days: 'Mon – Sat', hours: '5:30 AM – 10:00 PM' }])}>Add row</AddBtn>
        </div>
      </Panel>
      <SaveBtn onClick={save} busy={busy}>
        Save settings
      </SaveBtn>
    </div>
  )
}
