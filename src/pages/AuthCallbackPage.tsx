import { dashboardPath } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallbackPage() {
  const { finishGoogleSignIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    void finishGoogleSignIn()
      .then((role) => {
        if (!cancelled) navigate(dashboardPath(role), { replace: true })
      })
      .catch(() => {
        if (!cancelled) navigate('/login', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [finishGoogleSignIn, navigate])

  return (
    <div className="grid min-h-svh place-items-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Finishing Google sign-in…</p>
    </div>
  )
}
