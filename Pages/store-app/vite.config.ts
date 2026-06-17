import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'etalase-module': path.resolve(__dirname, '../../../eTalase Module/dist/index.mjs'),
    },
  },
})
