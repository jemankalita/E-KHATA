import {
  consumeIntendedRole,
  ensureProfile,
  loadProfile,
  resolveOAuthSession,
  startGoogleSignIn,
  type Profile,
} from '@/lib/auth'
import { isNativeRuntime } from '@/lib/nativeRuntime'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import type { Role } from '@/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  profile: Profile | null
  signInWithGoogle: (role: Role) => Promise<void>
  finishGoogleSignIn: () => Promise<Role>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = getSupabase()
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }

    let cancelled = false
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      if (!cancelled) setSession(next)
    })

    void client.auth.getSession().then(({ data: sessionData }) => {
      if (!cancelled) {
        setSession(sessionData.session)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [client])

  useEffect(() => {
    if (!client || !session?.user) {
      setProfile(null)
      return
    }
    let cancelled = false
    void loadProfile(client as never, session.user.id)
      .then((next) => {
        if (!cancelled) setProfile(next)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [client, session?.user])

  const signInWithGoogle = useCallback(
    async (role: Role) => {
      await startGoogleSignIn({
        client,
        storage: localStorage,
        origin: window.location.origin,
        role,
        stayInApp: isNativeRuntime(),
      })
    },
    [client],
  )

  const finishGoogleSignIn = useCallback(async () => {
    if (!client) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }
    const session = await resolveOAuthSession({
      href: window.location.href,
      getSession: () => client.auth.getSession(),
      exchangeCodeForSession: (code) => client.auth.exchangeCodeForSession(code),
    })
    const user = session.user
    if (!user) throw new Error('Google sign-in did not return a session. Try Continue as Customer or Shopkeeper again.')
    const next = await ensureProfile(client as never, user, consumeIntendedRole(localStorage))
    setSession(session)
    setProfile(next)
    return next.role
  }, [client])

  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [client])

  const value = useMemo(
    () => ({
      configured,
      loading,
      session,
      profile,
      signInWithGoogle,
      finishGoogleSignIn,
      signOut,
    }),
    [configured, finishGoogleSignIn, loading, profile, session, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
