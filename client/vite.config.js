import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
