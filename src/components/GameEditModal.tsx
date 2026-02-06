import { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AppGame, AppGameUpdate } from '../lib/types'

const ICON_BUCKET = 'game-icons'

interface GameEditModalProps {
  game: AppGame
  onClose: () => void
  onSaved: () => void
}

export function GameEditModal({ game, onClose, onSaved }: GameEditModalProps) {
  const [form, setForm] = useState<AppGameUpdate>({
    title: game.title,
    subtitle: game.subtitle,
    asset_folder: game.asset_folder,
    version: game.version,
    bundle_url: game.bundle_url,
    icon_url: game.icon_url ?? '',
    sort_order: game.sort_order,
    enabled: game.enabled,
    min_app_version: game.min_app_version ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iconUploading, setIconUploading] = useState(false)
  const iconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({
      title: game.title,
      subtitle: game.subtitle,
      asset_folder: game.asset_folder,
      version: game.version,
      bundle_url: game.bundle_url,
      icon_url: game.icon_url ?? '',
      sort_order: game.sort_order,
      enabled: game.enabled,
      min_app_version: game.min_app_version ?? '',
    })
  }, [game])

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setIconUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `${game.id}/icon.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from(ICON_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path)
      setForm((f) => ({ ...f, icon_url: urlData.publicUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '아이콘 업로드 실패')
    } finally {
      setIconUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      icon_url: form.icon_url || null,
      min_app_version: form.min_app_version || null,
      updated_at: new Date().toISOString(),
    }
    const { error: err } = await supabase
      .from('app_games')
      .update(payload)
      .eq('id', game.id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onSaved()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #333',
    borderRadius: 6,
    background: '#1a1a2e',
    color: '#eee',
  }
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 4, fontSize: 13, color: '#aaa' }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#16213e',
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px' }}>게임 편집: {game.id}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>제목</label>
            <input
              style={inputStyle}
              value={form.title ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>부제목</label>
            <input
              style={inputStyle}
              value={form.subtitle ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>asset_folder</label>
            <input
              style={inputStyle}
              value={form.asset_folder ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, asset_folder: e.target.value }))}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>버전</label>
            <input
              style={inputStyle}
              value={form.version ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>bundle_url</label>
            <input
              style={inputStyle}
              value={form.bundle_url ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bundle_url: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>아이콘</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {(form.icon_url ?? game.icon_url) && (
                <img
                  src={form.icon_url ?? game.icon_url ?? ''}
                  alt=""
                  style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#1a1a2e' }}
                />
              )}
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                disabled={iconUploading}
                style={{
                  padding: '6px 12px',
                  background: '#0f3460',
                  color: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  cursor: iconUploading ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                }}
              >
                {iconUploading ? '업로드 중...' : '파일로 업로드'}
              </button>
              <input
                style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                placeholder="또는 URL 입력"
                value={form.icon_url ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>sort_order</label>
            <input
              type="number"
              style={inputStyle}
              value={form.sort_order ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.enabled ?? true}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              <span style={labelStyle}>노출 (enabled)</span>
            </label>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>min_app_version</label>
            <input
              style={inputStyle}
              value={form.min_app_version ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, min_app_version: e.target.value || null }))}
            />
          </div>
          {error && <p style={{ color: '#f88', marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>
              취소
            </button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const btnSecondary: React.CSSProperties = {
  padding: '8px 16px',
  background: '#2a2a4a',
  color: '#eee',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px',
  background: '#4361ee',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}
