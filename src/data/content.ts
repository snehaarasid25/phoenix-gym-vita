import { site } from '../config/site'
import type { InstagramPost, Pillar, Testimonial } from '../types'

/** "Why Phoenix" differentiators — built on what the launch poster confirms. */
export const pillars: Pillar[] = [
  {
    title: 'Room to train big',
    description: `${site.claim ? 'Billed as the biggest gym in Vita, with space' : 'Space'} for heavy lifting, conditioning and HYROX training without waiting around.`,
  },
  {
    title: 'Recovery is built in',
    description: 'A steam bath on site, because the work you do after training matters as much as the training itself.',
  },
  {
    title: 'Mind as well as muscle',
    description: 'A dedicated meditation and yoga area for mobility, breathwork and focus, so you balance intensity with calm.',
  },
  {
    title: 'Made for the whole family',
    description: 'Extra family batches and separate male and female changing rooms mean everyone has a place at Phoenix.',
  },
  {
    title: 'Discipline is the culture',
    description: 'Strength, discipline, consistency. No shortcuts and no gimmicks, just honest work that compounds.',
  },
]

/**
 * ⚠️ SAMPLE TESTIMONIALS — FOR LAYOUT ONLY.
 * Items with `isSample: true` are rendered ONLY in development and never in a
 * production build. Replace with real member feedback (with their permission)
 * and set `isSample: false`.
 */
export const testimonials: Testimonial[] = [
  // ✅ Real review (shared by Sneha, with her photo, for the website)
  {
    id: 'sneha',
    quote:
      'Vita has never had a gym like this. The space looks stunning, and having HYROX training, a steam bath and a calm yoga area under one roof is a game changer. I’ve pre-booked my membership and I’m honestly counting down the days to my first session!',
    name: 'Sneha A.',
    detail: 'Pre-booked member',
    photo: '/images/testimonials/sneha-160.webp',
    isSample: false,
  },
  {
    id: 's1',
    quote: 'Sample review: the energy on the floor keeps you coming back. You walk in tired and leave fired up.',
    name: 'Sample Member',
    detail: 'Placeholder — replace with real review',
    isSample: true,
  },
  {
    id: 's2',
    quote: 'Sample review: I finally have a routine that sticks. The focus on form made all the difference for me.',
    name: 'Sample Member',
    detail: 'Placeholder — replace with real review',
    isSample: true,
  },
  {
    id: 's3',
    quote: 'Sample review: serious atmosphere, clean equipment and people who actually train. Exactly what Vita needed.',
    name: 'Sample Member',
    detail: 'Placeholder — replace with real review',
    isSample: true,
  },
]

/**
 * Instagram posts shown as OFFICIAL Instagram embeds (real thumbnails, playable
 * on the site). Newest first; the carousel shows the first `INSTAGRAM_EMBED_COUNT`.
 * To feature a new post: copy its link from Instagram ("…" → Copy link) and add
 * it at the top. `id` = the code in the URL (instagram.com/reel/<id>/).
 */
export const INSTAGRAM_EMBED_COUNT = 5

export const instagramPosts: InstagramPost[] = [
  { id: 'Dfru_2Zzhed', url: 'https://www.instagram.com/reel/Dfru_2Zzhed/', type: 'reel', caption: 'Latest reel' },
  { id: 'DfZwPsXzHM8', url: 'https://www.instagram.com/reel/DfZwPsXzHM8/', type: 'reel', caption: 'Inside Phoenix' },
  { id: 'DfKUIAuNq9E', url: 'https://www.instagram.com/reel/DfKUIAuNq9E/', type: 'reel', caption: 'The floor' },
  { id: 'De11UFWThjm', url: 'https://www.instagram.com/reel/De11UFWThjm/', type: 'reel', caption: 'Train with us' },
  { id: 'De1I4jmzX6R', url: 'https://www.instagram.com/p/De1I4jmzX6R/', type: 'post', caption: 'Phoenix Gym Vita' },
]
