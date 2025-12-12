import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Needed for Docker
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true, // Needed for Windows Docker
    },
    allowedHosts: true,
  },
})
