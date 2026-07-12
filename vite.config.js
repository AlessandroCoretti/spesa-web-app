import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.svg', 'cover.webp'],
      manifest: {
        name: 'Your Lists',
        short_name: 'Your Lists',
        description: 'Tieni traccia di cosa hai in casa, cosa sta finendo e cosa comprare.',
        theme_color: '#f9a8c9',
        background_color: '#fff5f8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'cover.webp', sizes: '364x253', type: 'image/webp', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
