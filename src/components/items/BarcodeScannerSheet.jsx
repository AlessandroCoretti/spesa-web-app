import { useEffect, useRef, useState } from 'react'
import { Sheet } from '../common/Sheet'
import { useStore } from '../../store'
import { lookupBarcode } from '../../utils/openFoodFacts'

export function BarcodeScannerSheet({ open, onClose, onResult }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const showToast = useStore((state) => state.showToast)
  const [status, setStatus] = useState('starting') // starting | scanning | error

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let handled = false

    const start = async () => {
      setStatus('starting')
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (cancelled) return
        const reader = new BrowserMultiFormatReader()
        setStatus('scanning')

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current,
          async (result) => {
            if (!result || handled || cancelled) return
            handled = true
            const barcode = result.getText()
            controlsRef.current?.stop()

            const product = await lookupBarcode(barcode)
            if (!product) {
              showToast("Prodotto non trovato, inserisci il nome manualmente")
            }
            onResult({ barcode, name: product?.name ?? '' })
          }
        )
        if (cancelled) {
          controls.stop()
        } else {
          controlsRef.current = controls
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    start()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [open])

  return (
    <Sheet open={open} onClose={onClose} title="Scansiona codice a barre">
      <div className="overflow-hidden rounded-2xl bg-ink">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      </div>
      {status === 'error' && (
        <p className="mt-3 text-sm text-coral-500">
          Non riusciamo ad accedere alla fotocamera. Controlla i permessi oppure chiudi e inserisci il
          prodotto manualmente.
        </p>
      )}
      {status === 'starting' && <p className="mt-3 text-sm text-ink-soft">Avvio della fotocamera…</p>}
      {status === 'scanning' && (
        <p className="mt-3 text-sm text-ink-soft">Inquadra il codice a barre della confezione.</p>
      )}
    </Sheet>
  )
}
