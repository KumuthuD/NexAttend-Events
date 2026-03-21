import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['logo.png', 'screenshot.png', 'screenshot_wide.png'],
      manifest: {
        name: 'NexAttend Seamless Event Check-In Powered by QR',
        description: 'A modern, standalone QR Code Event Check-In platform. Create registration forms, distribute digital tickets, and track attendance seamlessly in real-time.',
        screenshots: [
          {
            src: '/screenshot_wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot.png',
            sizes: '640x640',
            type: 'image/png'
          }
        ],
        short_name: 'NexAttend',
        start_url: '/',
        theme_color: '#0a0a1a',
        background_color: '#0a0a1a',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
