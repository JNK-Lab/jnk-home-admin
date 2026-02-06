import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AppGame } from '../lib/types'
import { GameList } from '../components/GameList'
import { GameEditModal } from '../components/GameEditModal'

export function Dashboard() {
  const [games, setGames] = useState<AppGame[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGame, setEditingGame] = useState<AppGame | null>(null)

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('app_games')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) {
      console.error(error)
      setGames([])
    } else {
      setGames(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const handleSaveEdit = () => {
    setEditingGame(null)
    fetchGames()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>App-Center 관리</h1>
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: '#aaa',
            border: '1px solid #444',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </header>

      {loading ? (
        <p>목록 로딩 중...</p>
      ) : (
        <GameList
          games={games}
          onEdit={(g) => setEditingGame(g)}
          onUploadComplete={fetchGames}
        />
      )}

      {editingGame && (
        <GameEditModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSaved={handleSaveEdit}
        />
      )}
    </div>
  )
}
