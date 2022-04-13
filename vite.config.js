import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pxtorem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://newuatapi.caoliu77.app',
        changeOrigin: true
      }
    }
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 16,
          propList: ['*'],
        }),
        autoprefixer({
          overrideBrowserslist: ['last 3 versions', '> 1%', 'ie 8', 'ie 7'],
        })
      ]
    }
  }
})
