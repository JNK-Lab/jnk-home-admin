import { supabase } from './supabase'

const OBJECT_PUBLIC_PREFIX = '/storage/v1/object/public/'

/**
 * Supabase Storage public URL을 목록용 썸네일 URL로 변환합니다.
 * Image Transformations(Pro 이상) 사용 시 용량을 줄일 수 있습니다.
 * 파싱 실패 또는 Supabase URL이 아니면 원본 URL을 그대로 반환합니다.
 */
export function getIconThumbnailUrl(iconUrl: string | null): string | null {
  if (iconUrl == null || iconUrl === '') return null
  try {
    const idx = iconUrl.indexOf(OBJECT_PUBLIC_PREFIX)
    if (idx === -1) return iconUrl
    const afterPrefix = iconUrl.slice(idx + OBJECT_PUBLIC_PREFIX.length)
    const firstSlash = afterPrefix.indexOf('/')
    if (firstSlash === -1) return iconUrl
    const bucket = afterPrefix.slice(0, firstSlash)
    const path = afterPrefix.slice(firstSlash + 1)
    const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
      transform: { width: 64, height: 64, quality: 60 },
    })
    return data.publicUrl
  } catch {
    return iconUrl
  }
}
