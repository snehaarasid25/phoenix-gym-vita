# Phoenix Gym — Vita, Maharashtra

Premium marketing website for **Phoenix Gym Vita** ([@phoenix_gym_03](https://www.instagram.com/phoenix_gym_03/)).
Primary goal: turn someone who discovers Phoenix on Instagram (usually on a phone) into someone who **visits or enquires**.

> Status: production-ready **frontend**. All business details that couldn't be verified are clearly marked
> placeholders. See [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) for everything needed from the gym owner.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321  (shows yellow "Placeholder" badges + sample testimonials)
npm run build      # static site → dist/
npm run preview    # serve dist/ at http://localhost:4321  (exactly what goes live; no badges)
npm run lint
```

Requires Node 22.12+ (Astro 7).

---

## Tech stack & why

| Choice | Why |
|---|---|
| **Astro 7** (static output) | A content-first marketing site is Astro's sweet spot. Every page is rendered to plain HTML at build time with per-page `<title>`, meta, Open Graph and JSON-LD, so Google and WhatsApp/Instagram previews see full content. Sections ship **zero JavaScript** by default. |
| **React 19 islands** (`@astrojs/react`) | Only genuinely interactive pieces hydrate: Navbar + theme toggle (`client:load`), mobile action bar (`client:idle`), enquiry form (`client:idle`), programmes showcase and gallery/lightbox (`client:visible`, so their JS loads only when scrolled near). |
| **Tiny vanilla motion script** (`src/scripts/site.ts`, ~1 KB) | Scroll reveals, parallax and "Enquire" buttons for the static sections, with no framework. Content stays visible with JS disabled. |
| **Motion** (Framer Motion) | Used inside islands only: nav indicator, mobile menu, programme panel transitions, gallery filtering, lightbox. |
| **Tailwind CSS v4** | Design tokens live in one `@theme` block (`src/styles/index.css`), including light/dark palettes. |
| **@astrojs/sitemap** + `robots.txt` route | Sitemap and robots generated at build from the `site` URL. |
| **Phosphor Icons** (`@phosphor-icons/react`) | One consistent icon family, including brand logos. In `.astro` files they render to static SVG (no JS). |
| **Self-hosted fonts** (@fontsource) | Bebas Neue (headlines), Manrope (body, labels, buttons), Cinzel (brand lines only). No Google Fonts request. |

JavaScript budget: the static sections ship ~1 KB. Islands load on demand (total ≈138 KB gzip across all islands, most of
it React + Motion, deferred until idle/visible) versus a single 169 KB bundle loaded up-front in the previous Vite SPA.

---

## Project structure

```
astro.config.mjs        ← site URL (canonical/sitemap), React + sitemap integrations, Tailwind
src/
  pages/                ← routes: index, privacy, terms, 404, robots.txt.ts
  layouts/              ← BaseLayout (head/SEO/theme/nav/footer), LegalLayout
  sections/             ← one .astro file per homepage section (static HTML)
  components/
    islands/            ← React islands: Navbar, MobileActionBar, ProgramsShowcase, GalleryGrid, EnquiryForm
    ui/                 ← shared React pieces (Button, Img, Logo, Lightbox, ThemeToggle…), also rendered statically
    contact/            ← QuickAction / ContactDetail (.astro)
    SectionHeader.astro, ButtonLink.astro, Footer.astro
  scripts/site.ts       ← reveals, parallax, data-enquire buttons
  config/
    site.ts             ← ALL business info: name, address, phone, WhatsApp, hours, socials, domain
    images.ts           ← ALL image URLs (hero, sections, gallery). Swap for real photos here.
    seo.ts              ← per-page titles & descriptions
  data/                 ← programs, facilities, membership plans, testimonials, Instagram posts
  utils/                ← enquiry store (cross-island), contact links, JSON-LD, image srcset, theme
  styles/index.css      ← design tokens, themes, reveal/parallax CSS, atmosphere utilities
public/                 ← favicon, icons, og-image.jpg, brand emblem, manifest
docs/LAUNCH_CHECKLIST.md
```

**Adding motion to a static section:** add `class="reveal"` (optional `style="--d:0.2s"` delay) for a fade-up,
`class="reveal-lines"` with `<span class="line"><span>…</span></span>` children for a masked headline,
or `data-parallax data-parallax-y="6,-6"` (also `-x`, `-scale`, `-fade`) for scroll-linked movement.

**Islands talking to each other:** "Enquire" buttons anywhere use `data-enquire="Annual membership"`;
`utils/enquiry.ts` stores the value and the form island picks it up, even if it hydrates later.

---

## Real photos

- Originals live in `photos/originals/` (not deployed). `photos/enhance.py` (Pillow) denoises, upscales 2×, adds clarity,
  lifts shadows, applies the champagne-gold grade + vignette, and writes responsive WebP files to
  `public/images/phoenix/<name>-{640,960,1280,1600,2000}.webp`.
- Register an edited photo in `src/config/images.ts` with a `{w}` placeholder, e.g.
  `src: '/images/phoenix/hero-athlete-{w}.webp'`; `utils/image.ts` builds the `srcset` automatically.
- In use: the "Ready to rise?" section (`hero-sunrise`: golden-hour edit of `beach-sunrise-flex.jpeg`). The first screen uses an HD stock
  photo (`stock-hero-barbell-anastase-maragos.jpg`, Unsplash licence → `hero-gym`) until a 4K Phoenix shoot
  (phone photos at 720p look soft full-screen). HD sources use `upscale=False` (light grade only). The other originals are kept for later use.
- To add a photo: drop it in `photos/originals/`, add an entry to `PHOTOS` in `enhance.py`, run `python3 photos/enhance.py`.

## Updating content (no coding knowledge needed beyond editing text)

| To change… | Edit |
|---|---|
| Phone, WhatsApp, address, hours, domain | `src/config/site.ts` |
| Prices / plan benefits | `src/data/membership.ts` (set `price: 1500`, `priceNote: '/ month'`, `verified: true`) |
| Programmes | `src/data/programs.ts` |
| Facilities | `src/data/facilities.ts` (set `status: 'confirmed'`) |
| Testimonials | `src/data/content.ts` (add real ones with `isSample: false`) |
| Any photo | `src/config/images.ts`. Put the file in `public/images/` and use `src: '/images/name.jpg'` |
| Instagram posts | `src/data/content.ts → instagramPosts` (official embeds; add new post links at the top) |
| Logo | `public/brand/phoenix-emblem.png` (official emblem, cut from the launch poster; swap for the original file) |
| Brand colours | `--color-brand-*` tokens in `src/styles/index.css` (sampled from the emblem's gold) |
| Light / dark palettes | `[data-theme='dark']` and `:root:not([data-theme='dark'])` blocks in `src/styles/index.css` |
| Launch stage / CTA labels | `site.ts → launchStatus` (`prebooking-soon` → `prebooking-open` → `open`) |

Values set to `null` are **hidden or shown as a graceful fallback**, never invented. For example, with no WhatsApp number
every enquiry button falls back to Instagram DM. As soon as `contact.whatsapp` is filled in, the whole site switches to
WhatsApp automatically, including the floating mobile bar, the enquiry form and the final CTA.

### Placeholder safety
- `npm run dev` shows yellow dashed **Placeholder / To verify / Sample** badges on unverified content.
- Production builds hide the badges **and never render sample testimonials**. If no real reviews exist,
  the section turns into a "Your story starts here" founding-member invitation.

---

## Design theme: "Ivory luxury" (light by default) + dark mode

- **Default is light**, taken from the gym's own launch poster: ivory/stone surfaces, deep ink text, ink-black primary
  buttons, and champagne gold reserved for accents (headline highlights, badges, icon tiles, dividers).
- **Rhythm:** ivory and stone sections are broken up by full-bleed dark "moments": hero, Facilities, Gallery, the final CTA and the
  footer (`data-theme="dark"` on those elements). Primary buttons automatically turn gold inside dark sections.
- **Type:** Bebas Neue (headlines) + Manrope (everything else); Cinzel only for brand lines such as "Where Fitness Meets Refinement".
- **Photos:** one consistent grade via the `.photo-grade` class (applied automatically by `<Img>`).
- **Premium layer** (`src/scripts/site.ts`, `src/scripts/embers.ts`, utilities in `src/styles/index.css`):
  inset rounded hero card with rising gold **embers** (2D canvas, paused off-screen); floating glass feature chips;
  rotating circular brand badge (`components/RotatingBadge.astro`); dark sections as inset rounded `.panel`s;
  `.bg-dots` texture on light sections; `.reveal-img` image wipe; cursor **spotlight** on cards; subtle **3D tilt** on large cards (`data-tilt`;
  buttons intentionally don't move under the cursor); **Lenis** smooth scrolling on mouse/trackpad (phones keep native momentum).
  Also: a branded **intro curtain** (home page, at most once per 12h, ≤0.9s, lifts when the hero image is ready), the hero
  headline rising **letter by letter**, **blur-to-sharp** scroll reveals, a gold **scroll-progress** line, the mantra band
  **leaning with scroll speed**, and **arrow-swap** button hovers.
- **Loading:** hero image + the two main fonts are preloaded; the navbar hydrates on idle; embers start after load.
  Measured: LCP 0.37s desktop / 1.23s on throttled 4G mobile, CLS 0.
  Everything is disabled for `prefers-reduced-motion`.
- **Dark mode** is still available from the sun/moon toggle; the choice is saved in `localStorage` (`phoenix-theme`).
  The inline script in `layouts/BaseLayout.astro` applies it before first paint (no flash).
- Palettes and button tokens: the `[data-theme='dark']` and `:root:not([data-theme='dark'])` blocks in `src/styles/index.css`.

## How the enquiry form works (no backend)

The form builds a message from name, phone, interest and message, then:
- **WhatsApp configured** → opens `wa.me/<number>` with the message pre-typed.
- **Not configured** → copies the message to the clipboard and opens Instagram DM (`ig.me/m/phoenix_gym_03`).

"Enquire" buttons on programmes and membership plans pre-select the interest and scroll to the form.
No personal data is stored, so there's no database, no GDPR/DPDP storage burden and no spam handling.

---

## Instagram

The Instagram section shows the latest posts as **official Instagram embeds**: real thumbnails, playable on the site,
with like counts and a "View profile" button. No API token is needed.

- **Which posts:** `src/data/content.ts → instagramPosts` (newest first), shown in a swipeable carousel with
  prev/next arrows and a counter (`INSTAGRAM_EMBED_COUNT`, default 5). To feature a new post, copy its link in
  Instagram ("…" → Copy link) and add it to the top.
- **Design:** Instagram's own card UI inside the embed can't be restyled or hidden (Meta's embed terms), so the
  presentation lives around it: numbered labels and gold-edged frames.
- **Performance and privacy:** Instagram's `embed.js` loads only when a visitor scrolls near the section
  (see `src/scripts/site.ts`). Before that, and with JavaScript off, each post is a styled card linking to Instagram.
- **Fully automatic feed (later):** to have the site pick up new posts by itself, switch the account to Business/Creator,
  create a Meta app and use the Instagram Graph API at build time (the token needs refreshing every 60 days).

## SEO implemented

**Local-search content (Vita, Maharashtra)**
- Every section `<h2>` starts with a plain, descriptive phrase (the small eyebrow label: e.g. "Gym facilities in Vita",
  "Training programmes in Vita", "Gym membership in Vita"), followed by the brand slogan. Keep this pattern when adding sections.
- **FAQ section** (`src/data/faq.ts`, `src/sections/Faq.astro`): 9 real local questions answered only from verified facts in
  `config/site.ts`, so answers update automatically (hours, prices, WhatsApp). The same data emits **FAQPage** JSON-LD.
- A plain-language local summary (name, city, district, state, street, facilities) sits beside the FAQ.
- No hidden text and no keyword stuffing; "Vita" appears naturally (~2% of words).

- Prerendered HTML for every route; one `<h1>` per page, ordered `h2`/`h3`
- Unique titles & descriptions (`src/config/seo.ts`), canonical URLs, Open Graph + Twitter cards, 1200×630 share image
- **JSON-LD `ExerciseGym`** (LocalBusiness subtype) built only from verified fields. Phone/address/geo/hours are added automatically once filled in
- `sitemap.xml` + `robots.txt` generated at build from `site.url`
- `geo.region` / `geo.placename` meta, `lang="en-IN"`
- Descriptive alt text on all images, lazy loading below the fold, responsive `srcset`, high-priority hero image
- Semantic landmarks, skip link, keyboard-accessible menu/lightbox/tabs, visible focus rings, reduced-motion support

⚠️ The site currently uses the temporary Netlify address (`https://phoenixgymvita.netlify.app`). When a real domain is bought, set it in **both** `astro.config.mjs` (`SITE_URL`) and
`src/config/site.ts` (`site.url`) before deploying.

---

## Deployment

Any static host works. Recommended: **Cloudflare Pages**, **Netlify** or **Vercel** (free tiers, automatic HTTPS, global CDN);
all three detect Astro automatically.

- Build command: `npm run build`
- Output directory: `dist`
- Connect the domain and the host issues SSL automatically (Let's Encrypt)
