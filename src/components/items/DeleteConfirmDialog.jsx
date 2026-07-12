import { AnimatePresence, motion } from 'framer-motion'

export function DeleteConfirmDialog({ open, itemName, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <motion.div
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative z-10 w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-(--shadow-soft-lg)"
          >
            <h3 className="font-heading text-lg font-semibold text-ink">Eliminare "{itemName}"?</h3>
            <p className="mt-1 text-sm text-ink-soft">Questa azione non può essere annullata.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full bg-blush-50 py-2.5 font-semibold text-ink-soft"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-full bg-coral-500 py-2.5 font-semibold text-white"
              >
                Elimina
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
