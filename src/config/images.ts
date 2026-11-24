import type { GalleryImage, ImageAsset } from '../types'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL IMAGE REGISTRY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every photo on the site is referenced from here — no image URLs live inside
 *  components. All current images are TEMPORARY Unsplash placeholders.
 *
 *  To swap in real Phoenix Gym photos:
 *    1. Drop the file into /public/images/ (e.g. /public/images/hero.jpg)
 *       — ideally 2400px wide JPG/WebP for hero, 1600px for others.
 *    2. Replace the entry below with:  { src: '/images/hero.jpg', alt: '…' }
 *    3. Write an honest, descriptive alt text (good for SEO + accessibility).
 *
 *  Unsplash URLs get responsive `srcset` automatically (see utils/image.ts).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const u = (id: string) => `https://images.unsplash.com/photo-${id}`

const placeholder = (id: string, alt: string, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  src: u(id),
  alt,
  credit: 'Unsplash (placeholder)',
  ...extra,
})

export const images = {
  // ── Hero & brand moments ──────────────────────────────────────────────────
  // ✅ REAL Phoenix photos (edited by photos/enhance.py → public/images/phoenix/)
  // HD stock hero (Anastase Maragos / Unsplash, 5472px original) graded by photos/enhance.py.
  // Temporary until a 4K Phoenix shoot.
  hero: {
    src: '/images/phoenix/hero-gym-{w}.webp',
    alt: 'Athlete standing behind a loaded barbell in a dark, dramatically lit gym',
    ratio: 3 / 2,
    position: '50% 38%',
  },
  heroMobile: {
    src: '/images/phoenix/hero-gym-{w}.webp',
    alt: 'Athlete standing behind a loaded barbell in a dark, dramatically lit gym',
    ratio: 3 / 2,
    position: '59% 30%',
  },
  // ✅ REAL Phoenix photo (cinematic golden-hour edit, photos/enhance.py)
  finalCta: {
    src: '/images/phoenix/hero-sunrise-{w}.webp',
    alt: 'Athlete silhouetted against a golden sunrise over the sea, flexing both arms',
    ratio: 16 / 9,
    position: '60% 50%',
  },

  // ── About ────────────────────────────────────────────────────────────────
  aboutPrimary: placeholder('1534438327276-14e5300c3a48', 'Long row of dumbbells on a rack with the gym floor in the background', { ratio: 1.5 }),
  aboutSecondary: placeholder('1579758629938-03607ccdbaba', 'Man resting between sets on a gym machine', { ratio: 0.8, position: '40% 50%' }),

  // ── Facilities ───────────────────────────────────────────────────────────
  strength: placeholder('1532029837206-abbe2b7620e3', 'Lifter performing a barbell squat inside a power rack', { ratio: 1.5 }),
  cardio: placeholder('1571902943202-507ec2618e8f', 'Cardio area with treadmills facing large windows', { ratio: 1.5 }),

  steamBath: placeholder('1761470575018-135c213340eb', 'Warmly lit modern steam room with a candle and stone benches', { ratio: 1.5 }),
  hyrox: placeholder('1534258936925-c58bed479fcb', 'Athletes doing functional conditioning work on turf with battle ropes', { ratio: 1.5 }),
  yoga: placeholder('1593810450967-f9c42742e326', 'Person in a calm yoga stretch on a mat, black and white', { ratio: 1.5 }),
  changingRooms: placeholder('1781274326569-7120016a6c7e', 'Dark, modern changing room with wooden benches and lockers', { ratio: 1.5 }),

  // ── Programs ─────────────────────────────────────────────────────────────
  progWeight: placeholder('1581009146145-b5ef050c2e1e', 'Athlete performing a barbell curl in the gym', { ratio: 1.5, position: '50% 30%' }),
  progStrength: placeholder('1517836357463-d25dfeac3438', 'Close-up of a lifter gripping a loaded barbell for a deadlift', { ratio: 1.5 }),
  progFatLoss: placeholder('1581122584612-713f89daa8eb', 'Woman in an explosive conditioning workout', { ratio: 1.5, position: '50% 30%' }),
  progFamily: placeholder('1536922246289-88c42f957773', 'Two people training together with box jumps', { ratio: 1.5 }),
  progHyrox: placeholder('1519505907962-0a6cb0167c73', 'Athlete pulling hard on a rowing machine', { ratio: 1.5 }),
  progYoga: placeholder('1552196563-55cd4e45efb3', 'Woman seated in a calm meditation pose on a mat', { ratio: 1.5 }),
  progPersonal: placeholder('1597452485669-2c7bb5fef90d', 'Man training on a strength machine', { ratio: 1.5 }),

  // ── Why Phoenix ──────────────────────────────────────────────────────────
  why: placeholder('1623874514711-0f321325f318', 'Spacious industrial gym interior with benches and racks', { ratio: 1.5 }),

} satisfies Record<string, ImageAsset>

/**
 * Gallery. Replace with real Phoenix Gym photos. Keep a mix of portrait and
 * landscape for a good masonry rhythm. `ratio` = width / height.
 */
const g = (id: string, img: { src: string; alt: string; credit?: string }, ratio: number, category: GalleryImage['category']): GalleryImage => ({
  id,
  ...img,
  ratio,
  category,
})

export const galleryImages: GalleryImage[] = [
  g('g1', { src: u('1637666062717-1c6bcfa4a4df'), alt: 'Moody gym interior with red accent lighting and weight racks' }, 1.5, 'Interior'),
  g('g2', { src: u('1605296867304-46d5465a13f1'), alt: 'Athlete setting up for a heavy deadlift in a dark gym' }, 0.75, 'Training'),
  g('g3', { src: u('1593079831268-3381b0db4a77'), alt: 'Wide view of a gym floor with warm lighting' }, 1.5, 'Interior'),
  g('g4', { src: u('1620188526357-ff08e03da266'), alt: 'Close-up of a barbell plate on the gym floor' }, 1, 'Equipment'),
  g('g5', { src: u('1550345332-09e3ac987658'), alt: 'Focused athlete between sets, black and white' }, 0.75, 'Lifestyle'),
  g('g6', { src: u('1517963879433-6ad2b056d712'), alt: 'Lifter setting up for a barbell deadlift' }, 1.5, 'Training'),
  g('g7', { src: u('1541534741688-6078c6bfb5c5'), alt: 'Athlete gripping a barbell in a squat rack' }, 0.75, 'Training'),
  g('g8', { src: u('1576678927484-cc907957088c'), alt: 'Rows of dumbbells with shallow depth of field' }, 1.5, 'Equipment'),
  g('g9', { src: u('1567013127542-490d757e51fc'), alt: 'Athlete training with intensity in a strength gym' }, 1, 'Training'),
  g('g10', { src: u('1549060279-7e168fcee0c2'), alt: 'Hand gripping a barbell in warm gym light' }, 0.75, 'Equipment'),
  g('g11', { src: u('1623874514711-0f321325f318'), alt: 'Industrial-style gym with high ceilings and racks' }, 1.5, 'Interior'),
  g('g12', { src: u('1554284126-aa88f22d8b74'), alt: 'Members training with dumbbells, black and white' }, 1, 'Lifestyle'),
].map((img) => ({ ...img, credit: 'Unsplash (placeholder)' }))

