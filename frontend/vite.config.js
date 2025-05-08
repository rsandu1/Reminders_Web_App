import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://34.70.223.84:5001', // Flask backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
