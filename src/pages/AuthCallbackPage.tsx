import { dashboardPath, runOnceGoogleCallback } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AuthCallbackPage() {
  const { finishGoogleSignIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    void runOnceGoogleCallback(() => finishGoogleSignIn())
      .then((role) => {
        navigate(dashboardPath(role), { replace: true })
      })
      .catch((error: unknown) => {
        const authError = error instanceof Error ? error.message : 'Google sign-in failed. Try again.'
        navigate('/login', { replace: true, state: { authError } })
      })
  }, [finishGoogleSignIn, navigate])

  return (
    <div className="grid min-h-svh place-items-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Finishing Google sign-in…</p>
    </div>
  )
}
