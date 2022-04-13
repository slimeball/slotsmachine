import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import pxtorem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    // proxy: {
    //   '/api': {
    //     target: 'https://newuatapi.caoliu77.app',
    //     changeOrigin: true
    //   }
    // }
  },
  plugins: [vue()],
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
