import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate sourcemaps in dev only for smaller prod bundles
    sourcemap: false,
    // Manual chunk splitting to reduce main bundle size
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React framework
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Animation library
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-framer';
          }
          // UI icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Backend/sync
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          // Analytics
          if (id.includes('node_modules/posthog-js/')) {
            return 'vendor-posthog';
          }
          // Other dependencies
          if (id.includes('node_modules/bcryptjs/')) {
            return 'vendor-other';
          }
        },
      },
    },
    // Enable CSS code splitting for smaller per-page CSS
    cssCodeSplit: true,
    // Reduce chunk size warning limit to encourage monitoring
    chunkSizeWarningLimit: 400,
  },
})
