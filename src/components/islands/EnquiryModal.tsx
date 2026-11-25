import { useEffect, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { onEnquiryRequest } from '../../utils/enquiry'
import EnquiryForm from './EnquiryForm'

type LenisLike = { stop: () => void; start: () => void }
const lenis = () => (window as Window & { __lenis?: LenisLike }).__lenis

/**
 * Enquiry pop-up (React island on every page). Opened by any "Get early access" / "Enquire" button via
 * utils/enquiry.ts → requestEnquiry(). Native <dialog>: focus stays inside, Esc closes, page behind is inert.
 */
export default function EnquiryModal() {
  const ref = useRef<HTMLDialogElement>(null)
  // The form mounts on first open (keeps the page light) and stays mounted, so typed text survives a close
  const [mounted, setMounted] = useState(false)

  useEffect(
    () =>
      onEnquiryRequest(() => {
        const dialog = ref.current
        window.__phoenixEnquiryOpen = false
        if (!dialog || dialog.open) return
        setMounted(true)
        dialog.showModal()
        lenis()?.stop()
      }),
    [],
  )

  const close = () => ref.current?.close()

  return (
    <dialog
      ref={ref}
      aria-label="Send an enquiry"
      data-lenis-prevent
      onClose={() => lenis()?.start()}
      // Full-screen, transparent and scrollable, so the card's gold glow is never cut off at the edges.
      // A click on the empty area around the card (the dialog itself or the centring wrapper) closes it.
      onClick={(e) => (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop !== undefined) && close()}
      className="site-dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-bone backdrop:bg-ash-950/80 backdrop:backdrop-blur-sm"
    >
      <div data-backdrop className="flex min-h-full items-center justify-center px-4 py-8 sm:p-8">
        <div className="dialog-card enquiry-card card-lux relative w-full max-w-2xl rounded-[1.75rem] p-6 pt-8 sm:p-10 [&_h3]:pr-12">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-bone/15 text-bone transition-colors hover:border-brand-400 hover:text-brand-300 sm:top-6 sm:right-6"
          >
            <X className="size-5" />
          </button>
          {/* Focus the name field on desktop only (on phones that would pop the keyboard over the form) */}
          {mounted && <EnquiryForm idPrefix="modal-enquiry" autoFocus={window.matchMedia('(pointer: fine)').matches} />}
        </div>
      </div>
    </dialog>
  )
}
