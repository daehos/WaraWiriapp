import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Kode inti notifikasi pemandu dipakai bersama dengan Backend (../Backend/src/core).
    fs: { allow: ['..'] },
    // Allows sharing the dev server via a cloudflared quick tunnel (random *.trycloudflare.com host each run).
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
