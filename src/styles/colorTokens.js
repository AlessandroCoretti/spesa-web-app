// Tailwind needs literal class names to detect them at build time, so each
// color variant used across the app is spelled out here instead of built
// dynamically with string interpolation.
export const COLOR_TOKENS = {
  blush: {
    bg50: 'bg-blush-50',
    bg100: 'bg-blush-100',
    bg200: 'bg-blush-200',
    bg500: 'bg-blush-500',
    text: 'text-blush-600',
    ring: 'ring-blush-400',
    border: 'border-blush-300',
  },
  lilac: {
    bg50: 'bg-lilac-50',
    bg100: 'bg-lilac-100',
    bg200: 'bg-lilac-200',
    bg500: 'bg-lilac-500',
    text: 'text-lilac-500',
    ring: 'ring-lilac-400',
    border: 'border-lilac-300',
  },
  mint: {
    bg50: 'bg-mint-50',
    bg100: 'bg-mint-100',
    bg200: 'bg-mint-200',
    bg500: 'bg-mint-500',
    text: 'text-mint-500',
    ring: 'ring-mint-400',
    border: 'border-mint-300',
  },
  peach: {
    bg50: 'bg-peach-50',
    bg100: 'bg-peach-100',
    bg200: 'bg-peach-200',
    bg500: 'bg-peach-500',
    text: 'text-peach-500',
    ring: 'ring-peach-400',
    border: 'border-peach-300',
  },
  coral: {
    bg50: 'bg-coral-50',
    bg100: 'bg-coral-100',
    bg200: 'bg-coral-200',
    bg500: 'bg-coral-500',
    text: 'text-coral-500',
    ring: 'ring-coral-400',
    border: 'border-coral-300',
  },
}

export function colorTokens(color) {
  return COLOR_TOKENS[color] ?? COLOR_TOKENS.blush
}
