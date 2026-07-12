import { useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { usePrevisioni } from '../hooks/usePrevisioni'
import { PrevisioniCard } from '../components/previsioni/PrevisioniCard'
import { EmptyState } from '../components/common/EmptyState'

export default function PrevisioniView() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const predictions = usePrevisioni(listId)

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <header className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(`/list/${listId}/in_casa`)}
          className="grid h-9 w-9 place-items-center rounded-full bg-blush-50 text-blush-600"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-semibold text-blush-700">Previsioni 🔮</h1>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6">
        {predictions.length === 0 ? (
          <EmptyState
            title="Nessuna previsione ancora"
            subtitle="Continua a segnare quando i prodotti finiscono: dopo un paio di cicli inizieremo a prevedere quando stanno per esaurirsi."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {predictions.map((prediction) => (
              <PrevisioniCard key={prediction.item.id} prediction={prediction} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
