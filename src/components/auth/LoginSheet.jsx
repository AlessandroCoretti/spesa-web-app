import { useStore } from '../../store'
import { Sheet } from '../common/Sheet'
import { MagicLinkForm } from './MagicLinkForm'

export function LoginSheet() {
  const activeSheet = useStore((state) => state.activeSheet)
  const closeSheet = useStore((state) => state.closeSheet)
  const open = activeSheet === 'login'

  return (
    <Sheet open={open} onClose={closeSheet} title="Accedi per sincronizzare">
      <p className="mb-4 text-sm text-ink-soft">
        Ti mandiamo un link via email, senza password. Da quel momento questa lista si aggiorna in
        tempo reale su tutti i dispositivi delle persone invitate.
      </p>
      <MagicLinkForm />
    </Sheet>
  )
}
