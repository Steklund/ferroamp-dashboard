import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api requests to backend at localhost:8003
      '/elpriset': {
        target: 'https://www.elprisetjustnu.se',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/elpriset/, '')
      },
    },
  },
})
