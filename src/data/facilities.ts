import { images } from '../config/images'
import type { Facility } from '../types'

/**
 * Facilities & zones.
 *
 * ✅ 'confirmed' — listed on the official "EST. 2026" launch poster:
 *    Steam Bath · HYROX Training · Meditation Area & Yoga · Male & Female Changing Rooms
 * ⚠️ 'proposed'  — very likely in any gym but not yet confirmed. Verify with the owner.
 */
export const facilities: Facility[] = [
  {
    id: 'strength',
    title: 'Strength & Free Weights',
    description: 'Racks, barbells, plates and dumbbells for the lifts that build real strength.',
    image: images.strength,
    status: 'proposed',
    size: 'large',
  },
  {
    id: 'hyrox',
    title: 'HYROX Training',
    description: 'Train for HYROX, the global fitness race: running, sleds, rowing, wall balls and hard conditioning.',
    image: images.hyrox,
    status: 'confirmed',
    size: 'tall',
  },
  {
    id: 'steam-bath',
    title: 'Steam Bath',
    description: 'Recovery is part of the programme. Unwind, loosen up and come back stronger.',
    image: images.steamBath,
    status: 'confirmed',
    size: 'regular',
  },
  {
    id: 'yoga',
    title: 'Meditation & Yoga',
    description: 'A dedicated, calm space for mobility, breathwork and mindfulness to balance the intensity.',
    image: images.yoga,
    status: 'confirmed',
    size: 'regular',
  },
  {
    id: 'cardio',
    title: 'Cardio Zone',
    description: 'Get your heart rate up for warm-ups, conditioning and endurance work.',
    image: images.cardio,
    status: 'proposed',
    size: 'wide',
  },
  {
    id: 'changing-rooms',
    title: 'Changing Rooms',
    description: 'Separate male and female changing rooms, so you can arrive from work and leave ready for the day.',
    image: images.changingRooms,
    status: 'confirmed',
    size: 'regular',
  },
]
