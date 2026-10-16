import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Memungkinkan akses dari luar container Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Mendukung Hot Module Reload (HMR) di lingkungan Windows Docker
    }
  }
})
