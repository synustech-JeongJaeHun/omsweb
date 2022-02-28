import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')

// https://vitejs.dev/config/

// path resolving in vite
// https://javascript.plainenglish.io/how-to-set-up-path-resolving-in-vite-ad284e0d9eae

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      'TrackObjects': path.resolve(__dirname, './src/TrackObjects'),
      'MapObjects': path.resolve(__dirname, './src/MapObjects')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/oms-track-monitor.ts'),
      name: 'oms-track-monitor',
      fileName: (format) => `oms-track-monitor.${format}.js`,
    },
  },
})
