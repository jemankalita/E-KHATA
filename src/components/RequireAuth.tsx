import { dashboardPath } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function RequireAuth() {
  const { configured, loading, session, profile } = useAuth()
  const location = useLocation()

  if (!configured) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">
        Checking your Google session…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (profile) {
    const wantsCustomer = location.pathname.startsWith('/customer')
    const wantsShop = location.pathname.startsWith('/shopkeeper')
    if (wantsCustomer && profile.role !== 'customer') {
      return <Navigate to={dashboardPath(profile.role)} replace />
    }
    if (wantsShop && profile.role !== 'shopkeeper') {
      return <Navigate to={dashboardPath(profile.role)} replace />
    }
  }

  return <Outlet />
}
