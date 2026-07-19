import type { Berry } from '../../models/berries'

// A stand-in "API". The UI consumes this through TanStack Query (useBerries),
// so swapping the mock for a real call won't ripple outward.
const CATALOG: Berry[] = [
  {
    id: 'razz',
    name: 'Raspberry',
    flavor: 'Tart',
    stat: 'Coolness',
    color: '#ff4d8d',
    rarity: 'common',
  },
  {
    id: 'blue',
    name: 'Blueberry',
    flavor: 'Sweet',
    stat: 'Cuteness',
    color: '#6c63ff',
    rarity: 'common',
  },
  {
    id: 'grape',
    name: 'Grape',
    flavor: 'Rich',
    stat: 'Cleverness',
    color: '#c74bff',
    rarity: 'common',
  },
  {
    id: 'zest',
    name: 'Lime Zest',
    flavor: 'Sour',
    stat: 'Toughness',
    color: '#b6e948',
    rarity: 'uncommon',
  },
  {
    id: 'gold',
    name: 'Golden Plum',
    flavor: 'Mellow',
    stat: 'Beauty',
    color: '#ffc14d',
    rarity: 'rare',
  },
  {
    id: 'dragon',
    name: 'Dragonfruit',
    flavor: 'Exotic',
    stat: 'Sheen',
    color: '#ff6b9d',
    rarity: 'rare',
  },
]

/**
 * Simulates a network request with a little latency so loading / error states
 * are exercised during development.
 */
export function fetchBerries(): Promise<Berry[]> {
  // TODO: swap for `client.get<Berry[]>('/berries')` once a real endpoint exists.
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(CATALOG)), 450)
  })
}
