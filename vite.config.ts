import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router') || id.includes('node_modules/react-dom')) return 'vendor'
          if (id.includes('node_modules/@supabase')) return 'supabase'
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules/jspdf')) return 'pdf'
          if (id.includes('node_modules/leaflet')) return 'map'
        },
      },
    },
  },
})
