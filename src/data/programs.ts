import { images } from '../config/images'
import type { Program } from '../types'

/**
 * Training programmes.
 * ✅ verified: true  — on the official launch poster (HYROX, Yoga & Meditation, Family Batches)
 * ⚠️ verified: false — availability not yet confirmed with the gym.
 * Keep copy free of guarantees or medical claims.
 */
export const programs: Program[] = [
  {
    id: 'weight-training',
    index: '01',
    title: 'Weight Training',
    tagline: 'The foundation of everything.',
    description:
      'Learn the fundamentals of resistance training with correct form, sensible loading and a structure you can follow week after week.',
    focus: ['Technique first', 'Progressive loading', 'All experience levels'],
    image: images.progWeight,
    verified: false,
  },
  {
    id: 'hyrox',
    index: '02',
    title: 'HYROX Training',
    tagline: 'Race-ready fitness.',
    description:
      'Prepare for HYROX, the global fitness race that combines running with eight functional stations: sled push and pull, rowing, burpee broad jumps, wall balls and more.',
    focus: ['Running + stations', 'Engine & endurance', 'Race simulation'],
    image: images.progHyrox,
    verified: true,
  },
  {
    id: 'strength-muscle',
    index: '03',
    title: 'Strength & Muscle',
    tagline: 'Lift heavier. Build more.',
    description:
      'Built around the big compound lifts with planned progression and smart hypertrophy work, for strength you can feel and muscle you can see.',
    focus: ['Compound lifts', 'Hypertrophy splits', 'Planned progression'],
    image: images.progStrength,
    verified: false,
  },
  {
    id: 'fat-loss',
    index: '04',
    title: 'Fat Loss',
    tagline: 'Burn hot. Stay consistent.',
    description:
      'Strength work combined with conditioning. A sustainable approach to getting leaner, with no crash plans.',
    focus: ['Strength + conditioning', 'Sustainable habits', 'Energy & endurance'],
    image: images.progFatLoss,
    verified: false,
  },
  {
    id: 'yoga-meditation',
    index: '05',
    title: 'Yoga & Meditation',
    tagline: 'Strong body. Calm mind.',
    description:
      'Mobility, breathwork and mindfulness in a dedicated meditation and yoga area, the perfect counterbalance to heavy training.',
    focus: ['Mobility & flexibility', 'Breathwork', 'Recovery & focus'],
    image: images.progYoga,
    verified: true,
  },
  {
    id: 'family-batches',
    index: '06',
    title: 'Family Batches',
    tagline: 'Fitness is better together.',
    description:
      'Extra batches set aside for families, so parents, partners and siblings can train side by side and keep each other consistent.',
    focus: ['Train together', 'Welcoming for all ages', 'Shared accountability'],
    image: images.progFamily,
    verified: true,
  },
  {
    id: 'personal-training',
    index: '07',
    title: 'Personal Training',
    tagline: 'Your goal. Your plan.',
    description:
      'One-to-one coaching built around your goal, schedule and current level, with close attention to form and accountability.',
    focus: ['Individual plan', 'Form correction', 'Accountability'],
    image: images.progPersonal,
    verified: false,
  },
]
