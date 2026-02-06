import { useRef, useState } from 'react'
import JSZip from 'jszip'
import { supabase } from '../lib/supabase'
import type { AppGame } from '../lib/types'

interface BundleUploadProps {
  game: AppGame
  onComplete: () => void
}

export function BundleUpload({ game, onComplete }: BundleUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [version, setVersion] = useState(game.version)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setError(null)
    setUploading(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
        const blob = await file.arrayBuffer()
        zip.file(path, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const path = `${game.id}/${version}.zip`
      const { error: uploadErr } = await supabase.storage
        .from('game-bundles')
        .upload(path, zipBlob, { upsert: true, contentType: 'application/zip' })
      if (uploadErr) {
        setError(uploadErr.message)
        setUploading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('game-bundles').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const { error: updateErr } = await supabase
        .from('app_games')
        .update({
          bundle_url: publicUrl,
          version,
          updated_at: new Date().toISOString(),
        })
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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <input
        ref={inputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '' } as unknown as Record<string, string>)}
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <input
        type="text"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        placeholder="버전"
        disabled={uploading}
        style={{
          width: 72,
          padding: '4px 8px',
          border: '1px solid #333',
          borderRadius: 4,
          background: '#1a1a2e',
          color: '#eee',
          fontSize: 12,
        }}
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
        {uploading ? '업로드 중...' : '번들 업로드'}
      </button>
      {error && <span style={{ fontSize: 12, color: '#f88' }}>{error}</span>}
    </div>
  )
}
