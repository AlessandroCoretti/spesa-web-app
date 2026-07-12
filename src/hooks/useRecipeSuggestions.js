import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store'
import recipes from '../data/recipes.json'

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\b(\w+?)[ei]\b/g, '$1') // naive italian plural trim (e.g. "mele" -> "mel", "pomodori" -> "pomodor")
}

function matches(itemName, ingredientName) {
  const a = normalize(itemName)
  const b = normalize(ingredientName)
  if (!a || !b) return false
  return a.includes(b) || b.includes(a)
}

export function useRecipeSuggestions(listId) {
  const inCasaItems = useStore(
    useShallow((state) =>
      Object.values(state.items).filter((item) => item.listId === listId && item.status === 'in_casa')
    )
  )

  return useMemo(() => {
    const itemNames = inCasaItems.map((item) => item.name)

    return recipes
      .map((recipe) => {
        const missing = recipe.ingredients.filter(
          (ingredient) => !itemNames.some((name) => matches(name, ingredient.name))
        )
        const requiredCount = recipe.ingredients.filter((i) => !i.optional).length
        const requiredMissing = missing.filter((i) => !i.optional).length
        const matchFraction =
          recipe.ingredients.length === 0
            ? 0
            : (recipe.ingredients.length - missing.length) / recipe.ingredients.length

        return { recipe, missing, matchFraction, requiredCount, requiredMissing }
      })
      .filter((r) => r.matchFraction > 0)
      .sort((a, b) => b.matchFraction - a.matchFraction)
      .slice(0, 8)
  }, [inCasaItems])
}
