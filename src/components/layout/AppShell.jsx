import { Outlet } from 'react-router'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { ListSwitcherSheet } from '../lists/ListSwitcherSheet'
import { ItemFormSheet } from '../items/ItemFormSheet'
import { Toast } from '../common/Toast'
import { InstallPrompt } from '../pwa/InstallPrompt'

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-blush-50/40">
      <TopBar />
      <main className="flex-1 pb-24">
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
