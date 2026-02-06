import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMessage({ type: 'err', text: error.message })
      return
    }
    setMessage({ type: 'ok', text: '로그인되었습니다.' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: 360,
          background: '#16213e',
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <h1 style={{ margin: '0 0 24px', fontSize: 22 }}>App-Center 관리</h1>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#aaa' }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #333',
              borderRadius: 8,
              background: '#1a1a2e',
              color: '#eee',
            }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#aaa' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #333',
              borderRadius: 8,
              background: '#1a1a2e',
              color: '#eee',
            }}
          />
        </div>
        {message && (
          <p style={{
            marginBottom: 16,
            fontSize: 14,
            color: message.type === 'err' ? '#f88' : '#8f8',
          }}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#4361ee',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
