import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronLeft, Download, LogIn, LogOut, Share2, Tag, Trash2, UserX } from 'lucide-react'
import { useStore } from '../store'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { detectPlatform } from '../utils/platform'
import { isSupabaseConfigured } from '../sync/supabaseClient'
import { CategoryManagerSheet } from '../components/categories/CategoryManagerSheet'
import { ShareSheet } from '../components/sharing/ShareSheet'
import { DeleteConfirmDialog } from '../components/items/DeleteConfirmDialog'

export default function ListSettingsView() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const list = useStore((state) => state.lists[listId])
  const listOrder = useStore((state) => state.listOrder)
  const deleteList = useStore((state) => state.deleteList)
  const showToast = useStore((state) => state.showToast)
  const { canInstall, installed, promptInstall } = useInstallPrompt()

  const session = useStore((state) => state.session)
  const openSheet = useStore((state) => state.openSheet)
  const signOut = useStore((state) => state.signOut)
  const deleteAccount = useStore((state) => state.deleteAccount)

  const [showCategories, setShowCategories] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingAccountDelete, setConfirmingAccountDelete] = useState(false)

  const canDelete = listOrder.length > 1

  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall()
      return
    }
    const { isIos, isFirefox, isMacSafari } = detectPlatform()
    if (isIos) {
      showToast('Tocca Condividi in Safari, poi "Aggiungi alla schermata Home"')
    } else if (isMacSafari) {
      showToast('Menu Safari → File → "Aggiungi al Dock"')
    } else if (isFirefox) {
      showToast('Firefox non supporta ancora l\'installazione: apri il link da Chrome, Edge o Safari')
    } else {
      showToast('Cerca l\'icona di installazione nella barra degli indirizzi del browser')
    }
  }

  const handleDelete = () => {
    deleteList(listId);
    const remaining = listOrder.filter((id) => id !== listId)
    showToast('Lista eliminata')
    navigate(`/list/${remaining[0]}/da_comprare`)
  }

  const handleSignOut = async () => {
    await signOut()
    showToast('Hai effettuato il logout')
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      showToast('Account eliminato')
      setConfirmingAccountDelete(false)
    } catch {
      showToast('Non siamo riusciti a eliminare l\'account, riprova')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(`/list/${listId}/da_comprare`)}
          className="grid h-9 w-9 place-items-center rounded-full bg-blush-50 text-blush-600"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-semibold text-blush-700">{list?.name}</h1>
      </header>

      <div className="flex flex-col gap-2.5 px-4">
        <button
          type="button"
          onClick={() => setShowCategories(true)}
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
        >
          <Tag className="h-5 w-5 text-lilac-500" />
          <span className="font-semibold text-ink">Gestisci categorie</span>
        </button>

        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
        >
          <Share2 className="h-5 w-5 text-mint-500" />
          <span className="font-semibold text-ink">Condividi lista</span>
        </button>

        {installed ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3.5 text-left">
            <Download className="h-5 w-5 text-ink-soft" />
            <span className="font-semibold text-ink-soft">App già installata</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
          >
            <Download className="h-5 w-5 text-blush-500" />
            <span className="font-semibold text-ink">Scarica l'app</span>
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
          >
            <Trash2 className="h-5 w-5 text-coral-500" />
            <span className="font-semibold text-coral-600">Elimina questa lista</span>
          </button>
        )}
      </div>

      {isSupabaseConfigured && (
        <div className="mt-6 flex flex-col gap-2.5 px-4">
          <p className="px-1 text-sm font-bold uppercase tracking-wide text-ink-soft">Account</p>

          {session ? (
            <>
              <div className="rounded-2xl bg-white/60 px-4 py-3.5 text-sm text-ink-soft">
                {session.user.email}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
              >
                <LogOut className="h-5 w-5 text-ink-soft" />
                <span className="font-semibold text-ink">Esci</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmingAccountDelete(true)}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
              >
                <UserX className="h-5 w-5 text-coral-500" />
                <span className="font-semibold text-coral-600">Elimina account</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openSheet('login')}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
            >
              <LogIn className="h-5 w-5 text-blush-500" />
              <span className="font-semibold text-ink">Accedi o crea un account</span>
            </button>
          )}
        </div>
      )}

      <CategoryManagerSheet open={showCategories} onClose={() => setShowCategories(false)} />
      <ShareSheet open={showShare} onClose={() => setShowShare(false)} />
      <DeleteConfirmDialog
        open={confirmingDelete}
        itemName={list?.name}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
      <DeleteConfirmDialog
        open={confirmingAccountDelete}
        title="Eliminare il tuo account?"
        description="Le liste di cui sei proprietario e tutti i loro dati verranno eliminati per sempre. Questa azione non può essere annullata."
        onCancel={() => setConfirmingAccountDelete(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
