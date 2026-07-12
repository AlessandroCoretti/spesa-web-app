import { Outlet } from 'react-router'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { ListSwitcherSheet } from '../lists/ListSwitcherSheet'
import { ItemFormSheet } from '../items/ItemFormSheet'
import { InstallPrompt } from '../pwa/InstallPrompt'
import { useStaleStockReminder } from '../../hooks/useStaleStockReminder'
import { useCloudSync } from '../../hooks/useCloudSync'

export function AppShell() {
  useStaleStockReminder()
  useCloudSync()

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <TopBar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
      <ListSwitcherSheet />
      <ItemFormSheet />
      <InstallPrompt />
    </div>
  )
}
