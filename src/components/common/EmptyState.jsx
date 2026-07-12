import { motion } from 'framer-motion'

export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="grid h-24 w-24 place-items-center rounded-full bg-blush-100"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-blush-400">
          <path
            d="M4 11.5 12 4l8 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="15" r="1.4" fill="currentColor" />
        </svg>
      </motion.div>
      <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="max-w-[22ch] text-sm text-ink-soft">{subtitle}</p>}
    </div>
  )
}
