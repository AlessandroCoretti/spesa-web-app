import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import StatusView from './pages/StatusView'
import ListSettingsView from './pages/ListSettingsView'
import ImportView from './pages/ImportView'
import { useStore } from './store'

function RootRedirect() {
  const activeListId = useStore((state) => state.activeListId)
  if (!activeListId) return null
  return <Navigate to={`/list/${activeListId}/da_comprare`} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/import" element={<ImportView />} />
      <Route path="/list/:listId/settings" element={<ListSettingsView />} />
      <Route element={<AppShell />}>
        <Route path="/list/:listId/:statusTab" element={<StatusView />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default App
