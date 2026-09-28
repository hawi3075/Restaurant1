import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
    // Ensure all routes fall back to index.html for SPA
    fallback: {
      from: /.*/, // Match all routes
      to: '/index.html' // Fall back to index.html
    }
  }
});