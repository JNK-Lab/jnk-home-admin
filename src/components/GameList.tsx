import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { AppGame } from '../lib/types'
import { getIconThumbnailUrl } from '../lib/iconUtils'
import { BundleUpload } from './BundleUpload'
import { IconUpload } from './IconUpload'

interface GameListProps {
  games: AppGame[]
  onEdit: (game: AppGame) => void
  onUploadComplete: () => void
  onToggleEnabled: (game: AppGame, enabled: boolean) => void
  onReorder: (reorderedGames: AppGame[]) => void
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [removed] = copy.splice(from, 1)
  copy.splice(to, 0, removed)
  return copy
}

export function GameList({ games, onEdit, onUploadComplete, onToggleEnabled, onReorder }: GameListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = games.findIndex((g) => g.id === active.id)
    const newIndex = games.findIndex((g) => g.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(games, oldIndex, newIndex))
  }

  return (
    <div style={{ overflowX: 'auto' }} className="admin-game-list">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
              <th style={thStyle}>제목</th>
              <th style={thStyle}>버전</th>
              <th style={thStyle}>노출</th>
              <th style={thStyle}>정렬</th>
              <th style={thStyle}>번들 URL</th>
              <th style={thStyle}>동작</th>
            </tr>
          </thead>
          <SortableContext items={games.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {games.map((g) => (
                <SortableRow
                  key={g.id}
                  game={g}
                  onEdit={onEdit}
                  onUploadComplete={onUploadComplete}
                  onToggleEnabled={onToggleEnabled}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  )
}

interface SortableRowProps {
  game: AppGame
  onEdit: (game: AppGame) => void
  onUploadComplete: () => void
  onToggleEnabled: (game: AppGame, enabled: boolean) => void
}

function SortableRow({ game: g, onEdit, onUploadComplete, onToggleEnabled }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: g.id })
  const style: React.CSSProperties = {
    borderTop: '1px solid #1a1a2e',
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5, zIndex: 1 } : {}),
  }
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td style={tdStyle}>
        {g.icon_url ? (
          <img src={getIconThumbnailUrl(g.icon_url) ?? g.icon_url} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
        ) : (
          <span style={{ color: '#666', fontSize: 12 }}>-</span>
        )}
      </td>
      <td style={tdStyle} className="admin-game-list-title" title={g.title}>{g.title}</td>
      <td style={tdStyle}>{g.version}</td>
      <td style={tdStyle}>
        <label className="admin-switch" style={switchLabelStyle} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!g.enabled}
            onChange={(e) => onToggleEnabled(g, e.target.checked)}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          />
          <span style={switchTrackStyle(g.enabled)}>
            <span style={switchThumbStyle(g.enabled)} />
          </span>
        </label>
      </td>
      <td style={tdStyle}>{g.sort_order}</td>
      <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {g.bundle_url ? '설정됨' : '-'}
      </td>
      <td style={tdStyle} className="admin-game-list-actions" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => onEdit(g)} style={btnSecondary}>
            편집
          </button>
          <IconUpload game={g} onComplete={onUploadComplete} />
          <BundleUpload game={g} onComplete={onUploadComplete} />
        </div>
      </td>
    </tr>
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

const switchLabelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'relative',
  minHeight: 44,
}

function switchTrackStyle(on: boolean): React.CSSProperties {
  return {
    width: 44,
    height: 24,
    borderRadius: 12,
    background: on ? '#4361ee' : '#444',
    position: 'relative',
    transition: 'background 0.2s',
  }
}

function switchThumbStyle(on: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    top: 2,
    left: on ? 22 : 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
  }
}
