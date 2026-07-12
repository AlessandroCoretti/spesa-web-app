import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function Fab({ onClick, label = 'Aggiungi' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-blush-500 px-5 py-3.5 font-heading font-semibold text-white shadow-(--shadow-soft-lg)"
    >
      <Plus className="h-5 w-5" />
      {label}
    </motion.button>
  )
}
