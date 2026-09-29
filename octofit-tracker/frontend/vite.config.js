import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiBaseUrl = process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-8000.app.github.dev`
  : 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
