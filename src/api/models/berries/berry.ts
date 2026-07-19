export type Rarity = 'common' | 'uncommon' | 'rare'

export interface Berry {
  id: string
  name: string
  flavor: string
  stat: string
  color: string
  rarity: Rarity
}
