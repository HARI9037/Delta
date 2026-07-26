import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user': 'http://localhost:5000',
      '/teacher': 'http://localhost:5000',
      '/payment': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
    },
  },
})
