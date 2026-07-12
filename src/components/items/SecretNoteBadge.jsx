import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useStore } from '../../store'

export function SecretNoteBadge({ item }) {
  const session = useStore((state) => state.session)
  const [revealed, setRevealed] = useState(false)

  if (!item.secretNote) return null
  // Never shown to whoever wrote it — it's meant as a surprise for the other member.
  if (session?.user?.id === item.secretNoteAuthorId) return null

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        setRevealed((r) => !r)
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-coral-100 px-2 py-0.5 text-xs font-semibold text-coral-500"
    >
      <Heart className="h-3 w-3" fill="currentColor" />
      {revealed ? item.secretNote : 'hai un messaggio'}
    </span>
  )
}
