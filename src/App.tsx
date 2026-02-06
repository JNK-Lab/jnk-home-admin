import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  const [session, setSession] = useState<{ user: { email?: string } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>로딩 중...</div>
  }

  if (!session) {
    return <Login />
  }

  return <Dashboard />
}
