import { useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { useRecipeSuggestions } from '../hooks/useRecipeSuggestions'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { EmptyState } from '../components/common/EmptyState'

export default function RecipesView() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const results = useRecipeSuggestions(listId)

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
        <h1 className="font-heading text-xl font-semibold text-blush-700">Salva Cena 🍝</h1>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6">
        {results.length === 0 ? (
          <EmptyState
            title="Nessun suggerimento ancora"
            subtitle="Aggiungi qualche prodotto a 'In casa' e torna qui per vedere le ricette possibili."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {results.map((result) => (
              <RecipeCard key={result.recipe.id} result={result} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
