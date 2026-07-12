import { ChefHat } from 'lucide-react'

export function RecipeCard({ result }) {
  const { recipe, missing, matchFraction } = result
  const isComplete = missing.length === 0

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-peach-100 text-peach-500">
          <ChefHat className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-semibold text-ink">{recipe.name}</p>
          <p className="text-xs text-ink-soft">{Math.round(matchFraction * 100)}% degli ingredienti disponibili</p>
        </div>
      </div>
      {recipe.instructions && <p className="mt-2 text-sm text-ink-soft">{recipe.instructions}</p>}
      {isComplete ? (
        <p className="mt-2 text-sm font-semibold text-mint-500">Hai tutto quello che serve! 🎉</p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          Ti manca: <span className="font-semibold text-coral-500">{missing.map((m) => m.name).join(', ')}</span>
        </p>
      )}
    </div>
  )
}
