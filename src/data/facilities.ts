import { images } from '../config/images'
import type { Program } from '../types'

/**
 * Gym facilities: each zone together with the training it's built for (the former
 * "Facilities" and "Training programmes" lists merged, so nothing is said twice).
 *
 * ✅ verified: true  — on the official "EST. 2026" launch poster:
 *    Steam Bath · HYROX Training · Meditation Area & Yoga · Male & Female Changing Rooms · Extra Family Batches
 * ⚠️ verified: false — very likely, but not yet confirmed with the owner.
 * Keep copy free of guarantees or medical claims. `more` = detail shown under "Read more".
 */
export const facilities: Program[] = [
  {
    id: 'strength',
    title: 'Strength Floor',
    tagline: 'Weight training · Strength & muscle',
    description:
      'Racks, barbells, plates and dumbbells for the lifts that build real strength, with the structure to learn them properly and keep progressing.',
    focus: ['Weight training', 'Strength & muscle', 'All levels'],
    more: {
      intro: 'The base for almost every goal: getting stronger, building muscle, losing fat or simply moving better day to day.',
      points: [
        { title: 'Learn the main lifts', text: 'Squats, deadlifts, presses and rows, taught step by step with safe technique before the weights go up.' },
        { title: 'Progress steadily', text: 'Small, planned increases in weight or reps week to week, so you keep improving without burning out.' },
        { title: 'Build muscle', text: 'Compound lifts first, then targeted accessory work with enough volume to grow, and enough rest to recover.' },
        { title: "Who it's for", text: 'Complete beginners through to experienced lifters. The plan is scaled to your current level.' },
      ],
    },
    image: images.strength,
    verified: false,
  },
  {
    id: 'hyrox',
    title: 'HYROX Zone',
    tagline: 'Race-ready fitness',
    description:
      'Train for HYROX, the global fitness race that combines running with eight functional stations: sled push and pull, rowing, burpee broad jumps, wall balls and more.',
    focus: ['Running + stations', 'Engine & endurance', 'Race simulation'],
    more: {
      intro: 'HYROX is a global indoor fitness race with the same format everywhere: 8 × 1 km runs, each followed by one functional workout station.',
      points: [
        { title: 'The 8 stations, in order', text: 'SkiErg 1,000 m · Sled push · Sled pull · Burpee broad jumps · Rowing 1,000 m · Farmers carry · Sandbag lunges · Wall balls.' },
        { title: 'How you train for it', text: 'Running engine, station technique and pacing, building up to full and partial race simulations.' },
        { title: 'Race divisions', text: 'Compete solo (Open or Pro), with a partner (Doubles) or as a team of four (Relay).' },
        { title: "Who it's for", text: 'Anyone who wants a goal to train for, from first-timers aiming to finish to athletes chasing a faster time.' },
      ],
    },
    image: images.hyrox,
    verified: true,
  },
  {
    id: 'cardio',
    title: 'Cardio & Conditioning',
    tagline: 'Fat loss · Endurance',
    description:
      'Get your heart rate up for warm-ups, conditioning and endurance work. Combined with strength training, it is a sustainable way to get leaner, with no crash plans.',
    focus: ['Fat loss', 'Conditioning', 'Sustainable habits'],
    more: {
      intro: 'A sustainable way to get leaner and fitter by combining conditioning with strength training. No crash diets and no extreme plans.',
      points: [
        { title: 'Strength + conditioning', text: 'Keep (and build) muscle while conditioning sessions raise your fitness and energy use.' },
        { title: 'Habits over hacks', text: 'Consistency, sleep and simple everyday habits that actually last.' },
        { title: "Who it's for", text: 'Anyone starting out or getting back on track. Everything is scaled to your current fitness.' },
      ],
    },
    image: images.cardio,
    verified: false,
  },
  {
    id: 'yoga',
    title: 'Yoga & Meditation',
    tagline: 'Strong body · Calm mind',
    description:
      'A dedicated, calm space for mobility, breathwork and mindfulness, the perfect counterbalance to heavy training.',
    focus: ['Mobility & flexibility', 'Breathwork', 'Recovery & focus'],
    more: {
      intro: 'A calm counterbalance to hard training, in a dedicated yoga and meditation area.',
      points: [
        { title: 'Mobility & flexibility', text: 'Move better, ease stiffness and support the rest of your training.' },
        { title: 'Breathwork & meditation', text: 'Simple breathing and mindfulness practice to settle the mind and improve focus.' },
        { title: "Who it's for", text: 'All levels. No prior yoga experience needed.' },
      ],
    },
    image: images.yoga,
    verified: true,
  },
  {
    id: 'steam-bath',
    title: 'Steam Bath',
    tagline: 'Recover · Reset',
    description:
      'Recovery is part of the programme. Unwind after a hard session, loosen up and come back stronger, with separate male and female changing rooms close by.',
    focus: ['Post-workout recovery', 'Unwind', 'Changing rooms'],
    more: {
      intro: 'Training is only half the work. The steam bath gives you a place to slow down and reset after a session.',
      points: [
        { title: 'After you train', text: 'A warm, quiet space to unwind once your workout is done.' },
        { title: 'Changing rooms', text: 'Separate male and female changing rooms, so you can arrive from work and leave ready for the day.' },
        { title: 'Good to know', text: 'Keep sessions short, stay hydrated, and check with your doctor first if you have any health condition.' },
      ],
    },
    image: images.steamBath,
    verified: true,
  },
  {
    id: 'personal-training',
    title: 'Personal Training',
    tagline: 'Your goal · Your plan',
    description:
      'One-to-one coaching built around your goal, schedule and current level, with close attention to form and accountability.',
    focus: ['Individual plan', 'Form correction', 'Accountability'],
    more: {
      intro: 'One-to-one coaching built entirely around you: your goal, your schedule and your starting point.',
      points: [
        { title: 'Start with an assessment', text: 'Your goals, training history and how you move, so the plan fits from day one.' },
        { title: 'A plan made for you', text: 'Sessions and progressions designed for your goal, adjusted as you improve.' },
        { title: 'Form & accountability', text: 'Close attention to technique, plus someone keeping you on track week after week.' },
      ],
    },
    image: images.progPersonal,
    verified: false,
  },
  {
    id: 'family-batches',
    title: 'Family Batches',
    tagline: 'Better together',
    description:
      'Extra batches set aside for families, so parents, partners and siblings can train side by side and keep each other consistent.',
    focus: ['Train together', 'All ages welcome', 'Shared accountability'],
    more: {
      intro: 'Extra batches set aside for families, so you can train together and keep each other consistent.',
      points: [
        { title: 'Train side by side', text: 'Parents, partners and siblings in the same session, each working at their own level.' },
        { title: 'Welcoming for all', text: 'A comfortable, supportive setting for every age and experience level.' },
        { title: 'Timings', text: 'Family batch timings will be shared before opening. Message us to register your interest.' },
      ],
    },
    image: images.progFamily,
    verified: true,
  },
]
