# Phoenix Gym — Launch Checklist

## ✅ Already verified and built into the site
- Name **Phoenix Gym Vita**, Instagram bio lines, **EST. 2026**
- Brand line *"Where Fitness Meets Refinement – Secure Your Legacy"* and the gold phoenix emblem (launch poster)
- Facilities: **Steam Bath, HYROX Training, Meditation Area & Yoga, Male & Female Changing Rooms, Extra Family Batches**
- "Biggest gym in Vita" (the gym's own poster claim, toggle via `site.ts → claim`)
- Launch status: *Pre-booking starting soon* (`site.ts → launchStatus` switches every CTA)
- Exact Google Maps pin (17.2766465, 74.5299646), Facebook page, YouTube @Phoenixgym1
- Address: Sambhaji Nagar, Nevari Rd, Suyog Colony, Bhavaninagar, Vita, Maharashtra 415311
- Phone & WhatsApp: +91 77578 46875

Each remaining item lists where it goes in the code.

## 🔴 Essential before launch

- [ ] **Opening hours** (each day, incl. any separate ladies' batch); `site.ts → hours`
- [ ] **Original logo file** (vector SVG/AI/PDF or 1000px+ transparent PNG). The site currently uses a cut-out from the poster screenshot; `public/brand/phoenix-emblem.png`
- [ ] **Domain name** (buy one, e.g. `phoenixgymvita.in` / `.com`); `site.ts → url`
- [ ] **Real photos of the gym** (at least: hero shot, 6 facility zones, 8–12 gallery images). Shoot in landscape, good light, no clutter; `config/images.ts`
- [ ] Confirm the **unverified** facilities: strength floor, cardio & conditioning, personal training; `data/facilities.ts`
- [ ] When pre-booking opens: set `launchStatus: 'prebooking-open'`, then `'open'` on opening day
- [ ] **Membership plans**: durations, prices (or confirm "price on enquiry"), and what each includes; `data/membership.ts`
- [ ] **Owner approval** of About copy, Privacy Policy and Terms (have the legal pages reviewed)

## 🟠 Important for improving the site

- [ ] Owner/founder story and photo (why Phoenix, when it opened)
- [ ] Trainer names, photos and **verified** certifications
- [ ] Equipment brands/list (good for SEO: "Hammer Strength gym in Vita", etc.)
- [ ] Other amenities: parking, lockers, showers, AC, supplements counter
- [ ] Family batch timings, ladies-only timings or a female trainer, if any (a big decision factor locally)
- [ ] HYROX details: equipment (sleds, rowers, SkiErg), coaching, race-prep plans
- [ ] Steam bath details: which plans include it, timings
- [ ] Opening offers / joining fee / free trial policy
- [ ] 3–6 **real member testimonials** (with written permission, first name + photo optional)
- [ ] Before/after transformations (with consent)
- [ ] Pick which Instagram posts to feature (gym-floor reels work best); add their links in `data/content.ts`
- [ ] **Google Business Profile**: create/verify it. This is the #1 driver of "gym near me" searches. Use the identical name, address and phone everywhere (NAP consistency)
- [ ] Email address (optional)
- [ ] Marathi version of key copy (helps local reach)

## 🟢 Optional future features

- [ ] Live Instagram feed (needs a Business account + Meta app + token refresh server)
- [ ] Enquiry form saved to a database + email/WhatsApp notification to the owner
- [ ] Small admin panel or headless CMS for prices, photos, hours, testimonials
- [ ] Online payments (Razorpay/UPI) for memberships
- [ ] Member login: renewals, attendance (QR check-in), workout plans
- [ ] Class/PT session booking
- [ ] Blog (fitness tips in English/Marathi) for long-tail SEO
- [ ] Analytics (Plausible / GA4) + Meta Pixel for Instagram ads

## SEO steps before launch

1. Set the real domain in `site.ts`, rebuild, deploy
2. Create & verify **Google Business Profile**: category "Gym", hours, photos, website link, Maps pin
3. Add the site to **Google Search Console** and submit `/sitemap.xml`
4. Test structured data at https://search.google.com/test/rich-results
5. Put the website link in the Instagram bio and on Google Business Profile
6. Ask the first members for Google reviews
7. List on JustDial / Sulekha with the same name, address and phone
