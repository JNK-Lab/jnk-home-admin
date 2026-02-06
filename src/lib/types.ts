export interface AppGame {
  id: string
  title: string
  subtitle: string
  asset_folder: string
  version: string
  bundle_url: string
  icon_url: string | null
  sort_order: number
  enabled: boolean
  min_app_version: string | null
  updated_at: string
}

export type AppGameUpdate = Partial<Pick<AppGame, 'title' | 'subtitle' | 'asset_folder' | 'version' | 'bundle_url' | 'icon_url' | 'sort_order' | 'enabled' | 'min_app_version'>>
