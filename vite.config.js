// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Important: this makes all routes serve index.html (SPA behavior)
  server: {
    historyApiFallback: true,   // ← this line fixes refresh errors
  },

  // Optional but recommended: make sure assets are resolved correctly
  resolve: {
    extensions: ['.js', '.jsx'],
  },
})