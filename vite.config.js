import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'chart-vendor': ['recharts'],
          'table-vendor': ['@tanstack/react-table']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5175,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175,
      clientPort: 5175
    },
    cors: true,
    strictPort: true
  }
})