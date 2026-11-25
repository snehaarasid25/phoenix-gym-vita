import { useCallback, useEffect, useState } from 'react'
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
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function PlansEditor({ notify }: { notify: Notify }) {
  const [rows, setRows, reload] = useTable<PlanRow>('plans', 'sort', notify)
  const [busy, setBusy] = useState<string | null>(null)
  const patch = (id: string, p: Partial<PlanRow>) => setRows((rs) => rs!.map((r) => (r.id === id ? { ...r, ...p } : r)))

  const save = async (r: PlanRow) => {
    const id = r._new ? slug(r.name) : r.id
    if (!id || !r.name.trim() || !r.duration.trim()) return notify('Name and duration are required.', true)
    setBusy(r.id)
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
            <Field label="Plan name">
              <input className={field} value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} placeholder="e.g. Annual" />
            </Field>
            <Field label="Duration">
              <input className={field} value={r.duration} onChange={(e) => patch(r.id, { duration: e.target.value })} placeholder="e.g. 12 Months" />
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
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Toggle checked={r.visible} onChange={(v) => patch(r.id, { visible: v })} label="Show on website" />
            <Toggle checked={r.highlight} onChange={(v) => patch(r.id, { highlight: v })} label="Highlight this plan" />
            {r.highlight && (
              <input className={cn(field, 'max-w-xs py-2 text-sm')} value={r.highlight_label ?? ''} onChange={(e) => patch(r.id, { highlight_label: e.target.value || null })} placeholder="Badge, e.g. Best value" />
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
    setRows((rs) => [{ id: `new-${Date.now()}`, title: '', description: null, discount_percent: 10, plan_ids: [], starts_on: today(), ends_on: today(), active: true, _new: true }, ...(rs ?? [])])

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
              <Field label="Title">
                <input className={field} value={r.title} onChange={(e) => patch(r.id, { title: e.target.value })} placeholder="e.g. Diwali offer" />
              </Field>
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
              <Field label="Starts on">
                <input type="date" className={field} value={r.starts_on} onChange={(e) => patch(r.id, { starts_on: e.target.value })} />
              </Field>
              <Field label="Ends on">
                <input type="date" className={field} value={r.ends_on} onChange={(e) => patch(r.id, { ends_on: e.target.value })} />
              </Field>
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

export function ReviewsEditor({ notify }: { notify: Notify }) {
  const [rows, setRows, reload] = useTable<ReviewRow>('reviews', 'sort', notify)
  const [busy, setBusy] = useState<string | null>(null)
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
                <input className={field} value={r.detail} onChange={(e) => patch(r.id, { detail: e.target.value })} placeholder="e.g. Member since 2026" />
              </Field>
            </div>
          </div>
          <Field label="Review" className="mt-4">
            <textarea className={cn(field, 'resize-y')} rows={4} value={r.quote} onChange={(e) => patch(r.id, { quote: e.target.value })} />
          </Field>
          <Field label="Phrase to show in gold (optional, copied exactly from the review)" className="mt-4">
            <input className={field} value={r.highlight ?? ''} onChange={(e) => patch(r.id, { highlight: e.target.value || null })} />
          </Field>
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
        setHours(data.hours ?? [])
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
          {hours.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input className={field} value={h.days} onChange={(e) => setHours((hs) => hs.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))} placeholder="e.g. Mon – Sat" />
              <input className={field} value={h.hours} onChange={(e) => setHours((hs) => hs.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} placeholder="e.g. 5:30 AM – 10:00 PM" />
              <DeleteBtn onClick={() => setHours((hs) => hs.filter((_, j) => j !== i))} label="Remove row" />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <AddBtn onClick={() => setHours((hs) => [...hs, { days: '', hours: '' }])}>Add row</AddBtn>
        </div>
      </Panel>
      <SaveBtn onClick={save} busy={busy}>
        Save settings
      </SaveBtn>
    </div>
  )
}
