export const STATUSES = ['da_comprare', 'esaurito', 'meta_scorta', 'in_casa']

export const STATUS_META = {
  da_comprare: { label: 'Da comprare', short: 'Da comprare', color: 'lilac', icon: 'cart', order: 0 },
  esaurito: { label: 'Esaurito', short: 'Esaurito', color: 'coral', icon: 'empty-box', order: 1 },
  meta_scorta: { label: 'Metà scorta', short: 'Metà scorta', color: 'peach', icon: 'half-box', order: 2 },
  in_casa: { label: 'In casa', short: 'In casa', color: 'mint', icon: 'house-heart', order: 3 },
}

export function isValidStatus(status) {
  return STATUSES.includes(status)
}
