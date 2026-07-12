// Free, keyless, CORS-friendly product lookup by barcode.
// Returns null on any failure (offline, not found, bad response) so callers
// can fall back to manual entry without a dead end.
export async function lookupBarcode(barcode) {
  if (!navigator.onLine) return null
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product?.product_name) return null
    return { name: data.product.product_name }
  } catch {
    return null
  }
}
