import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    watch: {
      ignored: ['**/smartHire/**']
    }
  },
  resolve: {
    preserveSymlinks: false,
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{js,ts,jsx,tsx}']
  }
})
