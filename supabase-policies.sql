-- App-Center 관리 웹 사용을 위한 Supabase 정책
-- 관리 웹 사용 전 Supabase SQL Editor에서 실행하세요.

-- 1) app_games: 인증된 사용자는 전체 조회 + INSERT/UPDATE/DELETE 가능 (anon은 SELECT만 기존 유지)
CREATE POLICY "app_games_select_authenticated"
  ON app_games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "app_games_insert_authenticated"
  ON app_games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "app_games_update_authenticated"
  ON app_games FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "app_games_delete_authenticated"
  ON app_games FOR DELETE
  TO authenticated
  USING (true);

-- 2) Storage game-bundles: 인증된 사용자만 업로드 가능
-- Supabase Dashboard에서 수동 설정:
--   Storage > game-bundles > Policies > New Policy
--   Policy name: Allow authenticated upload
--   Allowed operations: INSERT, UPDATE
--   Target roles: authenticated
--   WITH CHECK: true

-- 3) Storage game-icons: 게임별 아이콘 업로드 (인증된 사용자)
-- Dashboard > Storage > New bucket > 이름: game-icons, Public 체크 후 생성.
-- Policies > New Policy: INSERT, UPDATE 허용, Target roles: authenticated, WITH CHECK: true
-- 경로 규칙: {game_id}/icon.png (관리 웹에서 업로드 시 사용)
