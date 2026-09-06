import { Outlet } from 'react-router-dom'
import { MobileTabBar, MobileTopBar } from './MobileNav'
import { PageTransition } from './PageTransition'
import { Sidebar } from './Sidebar'
import { SvgBackdrop } from './SvgBackdrop'
import { Toast } from './ui/Toast'
import { useKhata } from '../store/KhataStore'

export function AppShell() {
  const { toast, clearToast } = useKhata()

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <SvgBackdrop />
      <a href="#shop-main" className="skip-link">
        Skip to content
      </a>
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      <div className="min-w-0">
        <MobileTopBar />
        <main
          id="shop-main"
          className="min-w-0 px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10 lg:pt-8"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileTabBar />
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={clearToast} /> : null}
    </div>
  )
}
