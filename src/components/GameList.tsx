import type { AppGame } from '../lib/types'
import { BundleUpload } from './BundleUpload'
import { IconUpload } from './IconUpload'

interface GameListProps {
  games: AppGame[]
  onEdit: (game: AppGame) => void
  onUploadComplete: () => void
}

export function GameList({ games, onEdit, onUploadComplete }: GameListProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: '#16213e',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <thead>
          <tr style={{ background: '#0f3460', textAlign: 'left' }}>
            <th style={thStyle}>아이콘</th>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>제목</th>
            <th style={thStyle}>버전</th>
            <th style={thStyle}>노출</th>
            <th style={thStyle}>정렬</th>
            <th style={thStyle}>번들 URL</th>
            <th style={thStyle}>동작</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.id} style={{ borderTop: '1px solid #1a1a2e' }}>
              <td style={tdStyle}>
                {g.icon_url ? (
                  <img src={g.icon_url} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
                ) : (
                  <span style={{ color: '#666', fontSize: 12 }}>-</span>
                )}
              </td>
              <td style={tdStyle}>{g.id}</td>
              <td style={tdStyle}>{g.title}</td>
              <td style={tdStyle}>{g.version}</td>
              <td style={tdStyle}>{g.enabled ? '예' : '아니오'}</td>
              <td style={tdStyle}>{g.sort_order}</td>
              <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.bundle_url ? '설정됨' : '-'}
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onEdit(g)}
                    style={btnSecondary}
                  >
                    편집
                  </button>
                  <IconUpload game={g} onComplete={onUploadComplete} />
                  <BundleUpload game={g} onComplete={onUploadComplete} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  color: '#aaa',
  fontWeight: 600,
}
const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
}
const btnSecondary: React.CSSProperties = {
  padding: '6px 12px',
  background: '#2a2a4a',
  color: '#eee',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
}
