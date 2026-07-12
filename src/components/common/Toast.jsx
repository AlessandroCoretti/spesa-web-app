import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store'

export function Toast() {
  const toast = useStore((state) => state.toast)
  const clearToast = useStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => clearToast(), 2200)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft-lg)"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
