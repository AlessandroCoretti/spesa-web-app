import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import StatusView from './pages/StatusView'
import ListSettingsView from './pages/ListSettingsView'
import ImportView from './pages/ImportView'
import JoinView from './pages/JoinView'
import RecipesView from './pages/RecipesView'
import PrevisioniView from './pages/PrevisioniView'
import BudgetView from './pages/BudgetView'
import StatsView from './pages/StatsView'
import { Toast } from './components/common/Toast'
import { LoginSheet } from './components/auth/LoginSheet'
import { useStore } from './store'

function RootRedirect() {
  const activeListId = useStore((state) => state.activeListId)
  if (!activeListId) return null
  return <Navigate to={`/list/${activeListId}/da_comprare`} replace />
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/import" element={<ImportView />} />
        <Route path="/join/:code" element={<JoinView />} />
        <Route path="/list/:listId/settings" element={<ListSettingsView />} />
        <Route path="/list/:listId/ricette" element={<RecipesView />} />
        <Route path="/list/:listId/previsioni" element={<PrevisioniView />} />
        <Route path="/list/:listId/budget" element={<BudgetView />} />
        <Route path="/list/:listId/statistiche" element={<StatsView />} />
        <Route element={<AppShell />}>
          <Route path="/list/:listId/:statusTab" element={<StatusView />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <LoginSheet />
      <Toast />
    </>
  )
}

export default App
