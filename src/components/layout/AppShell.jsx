import { Outlet } from 'react-router'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { ListSwitcherSheet } from '../lists/ListSwitcherSheet'
import { ItemFormSheet } from '../items/ItemFormSheet'
import { Toast } from '../common/Toast'
import { InstallPrompt } from '../pwa/InstallPrompt'

export function AppShell() {
  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-blush-50/40">
      <TopBar />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
      <ListSwitcherSheet />
      <ItemFormSheet />
      <Toast />
      <InstallPrompt />
    </div>
  )
}
