# App-Center 관리 웹

게임 목록(메타데이터) 편집 및 게임 번들 업로드를 위한 관리 사이트입니다.  
파일/폴더를 선택하면 브라우저에서 zip으로 압축 후 Supabase Storage에 올리고, `app_games`를 자동으로 갱신합니다.

## 사전 요구 사항

1. **Supabase 프로젝트**: [app-center/README.md](../README.md) 참고해 `app_games` 테이블 및 `game-bundles` Storage 버킷 생성
2. **관리 웹용 Supabase 정책**: 아래 "Supabase 정책 적용" 실행
3. **Supabase Auth 사용자**: Dashboard > Authentication > Users 에서 관리자 이메일/비밀번호로 사용자 추가 (또는 회원가입 후 사용)

## Supabase 정책 적용

관리 웹에서 수정·업로드를 쓰려면 **반드시** 다음을 적용하세요.

1. **SQL Editor**에서 [supabase-policies.sql](./supabase-policies.sql) 내용 실행  
   - `app_games`에 대한 인증 사용자용 INSERT/UPDATE/DELETE 정책 추가

2. **Storage 정책** (Dashboard에서 수동 설정)  
   - **game-bundles**: Storage > `game-bundles` > Policies > New Policy — Name: `Allow authenticated upload`, INSERT·UPDATE, authenticated, WITH CHECK: `true`  
   - **game-icons**: Storage > New bucket > 이름 `game-icons`, Public 체크 후 생성. 동일하게 Policies에서 authenticated용 INSERT·UPDATE 정책 추가. (게임별 아이콘 업로드 시 사용, 앱 목록에 표시됨)

## 환경 변수

`env.example`을 복사해 `.env` 파일을 만든 뒤 값을 채우세요.

```bash
cp env.example .env
```

- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL (예: `https://xxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Project Settings > API > anon public key

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 로그인하면 대시보드를 사용할 수 있습니다.

## 빌드 및 배포

```bash
npm run build
```

`dist/` 폴더를 Vercel, Netlify 등 정적 호스팅에 배포하면 됩니다. 배포 시에도 동일한 환경 변수를 설정하세요.

### GitHub Pages

저장소 루트에 `.github/workflows/deploy-admin-pages.yml`이 있으면 **main** 브랜치 푸시 시 관리 사이트가 자동으로 GitHub Pages에 배포됩니다.

1. **저장소 설정**: GitHub repo → Settings → Pages → Source: **GitHub Actions**
2. **Secrets 등록**: Settings → Secrets and variables → Actions 에서 다음 추가  
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL  
   - `VITE_SUPABASE_ANON_KEY`: anon public key  
3. **main에 푸시** 후 Actions에서 "Deploy Admin to GitHub Pages" 실행 완료되면  
   - 주소: `https://<사용자>.github.io/<저장소이름>/`

## 사용 방법

- **로그인**: Supabase Auth 이메일/비밀번호로 로그인
- **게임 목록**: 테이블에서 전체 게임 확인
- **편집**: 행의 "편집" 버튼 → 제목, 부제목, 버전, 노출 여부, 정렬 순서 등 수정 후 저장
- **번들 업로드**:  
  1. 해당 게임의 "번들 업로드" 왼쪽 입력란에 버전(예: `1.0.1`) 입력  
  2. "번들 업로드" 클릭 후 **폴더** 또는 **여러 파일** 선택 (폴더 선택 시 브라우저가 폴더 내 모든 파일을 포함)  
  3. 자동으로 zip 생성 → Storage `game-bundles/{게임ID}/{버전}.zip` 업로드 → `app_games`의 `bundle_url`, `version`, `updated_at` 갱신

폴더를 선택할 때는 게임 asset 폴더 전체(예: `game` 또는 `drum-hero`)를 선택하면 됩니다. zip 내부 구조는 선택한 폴더 구조가 그대로 유지됩니다.
