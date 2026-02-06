import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AppGame } from '../lib/types'

interface IconUploadProps {
  game: AppGame
  onComplete: () => void
}

const BUCKET = 'game-icons'

export function IconUpload({ game, onComplete }: IconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      setError('이미지 파일을 선택하세요.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `${game.id}/icon.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) {
        setError(uploadErr.message)
        setUploading(false)
        e.target.value = ''
        return
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const { error: updateErr } = await supabase
        .from('app_games')
        .update({ icon_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', game.id)
      if (updateErr) {
        setError(updateErr.message)
      } else {
        onComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '6px 12px',
          background: '#0f3460',
          color: '#eee',
          border: 'none',
          borderRadius: 6,
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: 13,
        }}
      >
        {uploading ? '업로드 중...' : '아이콘'}
      </button>
      {error && <span style={{ fontSize: 12, color: '#f88' }}>{error}</span>}
    </div>
  )
}
