import { motion, AnimatePresence } from 'framer-motion'
import { Download } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.button
          type="button"
          onClick={promptInstall}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-white shadow-(--shadow-soft-lg)"
        >
          <Download className="h-4 w-4" />
          Installa Your Lists sul dispositivo
        </motion.button>
      )}
    </AnimatePresence>
  )
}
