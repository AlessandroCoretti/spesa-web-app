import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Upload } from 'lucide-react'
import { useStore } from '../store'

function decodeHashPayload() {
  const hash = window.location.hash
  const match = hash.match(/data=([^&]+)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(escape(atob(match[1]))))
  } catch {
    return null
  }
}

export default function ImportView() {
  const navigate = useNavigate()
  const importList = useStore((state) => state.importList)
  const showToast = useStore((state) => state.showToast)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fromHash = decodeHashPayload()
    if (fromHash) setPayload(fromHash)
  }, [])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      setPayload(JSON.parse(text))
      setError(null)
    } catch {
      setError('Il file non è una lista Dispensa valida.')
    }
  }

  const handleConfirm = () => {
    const id = importList(payload)
    showToast('Lista importata 🎉')
    navigate(`/list/${id}/da_comprare`)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-blush-700">Importa una lista</h1>

      {!payload && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-blush-200 px-8 py-10 text-blush-500">
          <Upload className="h-8 w-8" />
          <span className="font-semibold">Scegli un file .json condiviso</span>
          <input type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </label>
      )}

      {error && <p className="text-sm text-coral-500">{error}</p>}

      {payload && (
        <div className="w-full max-w-xs rounded-3xl bg-blush-50 p-5">
          <p className="font-heading text-lg font-semibold text-ink">{payload.name ?? 'Lista senza nome'}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {(payload.categories ?? []).length} categorie · {(payload.items ?? []).length} prodotti
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-4 w-full rounded-full bg-blush-500 py-3 font-heading font-semibold text-white"
          >
            Importa questa lista
          </button>
        </div>
      )}
    </div>
  )
}
