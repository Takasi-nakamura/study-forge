import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages でリポジトリ名がサブパスになる場合に対応。
// package.json の "homepage" や、ビルド時の環境変数 VITE_BASE_PATH で上書き可能。
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
  },
})
