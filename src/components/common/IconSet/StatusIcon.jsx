import { CartIcon, EmptyBoxIcon, HalfBoxIcon, HouseHeartIcon } from './StatusIcons'

const ICONS = {
  cart: CartIcon,
  'empty-box': EmptyBoxIcon,
  'half-box': HalfBoxIcon,
  'house-heart': HouseHeartIcon,
}

export function StatusIcon({ icon, className }) {
  const Cmp = ICONS[icon] ?? CartIcon
  return <Cmp className={className} />
}
