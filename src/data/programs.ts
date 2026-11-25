import { images } from '../config/images'
import type { Program } from '../types'

/**
 * Training programmes.
 * ✅ verified: true  — on the official launch poster (HYROX, Yoga & Meditation, Family Batches)
 * ⚠️ verified: false — availability not yet confirmed with the gym.
 * Keep copy free of guarantees or medical claims.
 * `more` = general programme detail shown under "More" (owner to review; no unconfirmed gym specifics).
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
    more: {
      intro:
        "Weight training is the base for almost every goal: getting stronger, building muscle, losing fat or simply moving and feeling better day to day.",
      points: [
        { title: "Learn the main lifts", text: "Squats, deadlifts, presses and rows, taught step by step with safe, efficient technique before the weights go up." },
        { title: "Progress steadily", text: "Small, planned increases in weight or reps week to week, so you keep improving without burning out." },
        { title: "Who it's for", text: "Complete beginners through to experienced lifters. The plan is scaled to your current level." },
      ],
    },
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
    more: {
      intro:
        "HYROX is a global indoor fitness race with the same format everywhere: 8 × 1 km runs, each followed by one functional workout station.",
      points: [
        { title: "The 8 stations, in order", text: "SkiErg 1,000 m · Sled push · Sled pull · Burpee broad jumps · Rowing 1,000 m · Farmers carry · Sandbag lunges · Wall balls." },
        { title: "How you train for it", text: "Running engine, station technique and pacing, building up to full and partial race simulations." },
        { title: "Race divisions", text: "Compete solo (Open or Pro), with a partner (Doubles) or as a team of four (Relay)." },
        { title: "Who it's for", text: "Anyone who wants a goal to train for, from first-timers aiming to finish to athletes chasing a faster time." },
      ],
    },
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
    more: {
      intro:
        "For people who want to get visibly stronger and build muscle with a clear, structured plan.",
      points: [
        { title: "Compound lifts first", text: "Squat, bench, deadlift and overhead press as the backbone of every week." },
        { title: "Hypertrophy work", text: "Targeted accessory training to build muscle where you want it, with enough volume to grow." },
        { title: "Recovery matters", text: "Sensible rest between sessions, because muscle is built when you recover, not just when you train." },
      ],
    },
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
    more: {
      intro:
        "A sustainable way to get leaner by combining strength training with conditioning. No crash diets and no extreme plans.",
      points: [
        { title: "Strength + conditioning", text: "Keep (and build) muscle while conditioning sessions raise your fitness and energy use." },
        { title: "Habits over hacks", text: "Consistency, sleep and simple everyday habits that actually last." },
        { title: "Who it's for", text: "Anyone starting out or getting back on track. Everything is scaled to your current fitness." },
      ],
    },
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
    more: {
      intro:
        "A calm counterbalance to hard training, in a dedicated yoga and meditation area.",
      points: [
        { title: "Mobility & flexibility", text: "Move better, ease stiffness and support the rest of your training." },
        { title: "Breathwork & meditation", text: "Simple breathing and mindfulness practice to settle the mind and improve focus." },
        { title: "Who it's for", text: "All levels. No prior yoga experience needed." },
      ],
    },
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
    more: {
      intro:
        "Extra batches set aside for families, so you can train together and keep each other consistent.",
      points: [
        { title: "Train side by side", text: "Parents, partners and siblings in the same session, each working at their own level." },
        { title: "Welcoming for all", text: "A comfortable, supportive setting for every age and experience level." },
        { title: "Timings", text: "Family batch timings will be shared before opening. Message us to register your interest." },
      ],
    },
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
    more: {
      intro:
        "One-to-one coaching built entirely around you: your goal, your schedule and your starting point.",
      points: [
        { title: "Start with an assessment", text: "Your goals, training history and how you move, so the plan fits from day one." },
        { title: "A plan made for you", text: "Sessions and progressions designed for your goal, adjusted as you improve." },
        { title: "Form & accountability", text: "Close attention to technique, plus someone keeping you on track week after week." },
      ],
    },
    image: images.progPersonal,
    verified: false,
  },
]
