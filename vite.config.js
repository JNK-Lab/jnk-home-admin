import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// GitHub Pages: base는 저장소 이름 (예: /app-center-admin/). 로컬은 /
export default defineConfig({
    plugins: [react()],
    base: process.env.BASE_PATH || '/',
});
