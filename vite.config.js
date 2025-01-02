import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import {PrimeVueResolver} from 'unplugin-vue-components/resolvers'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    mkcert()
  ],
  esbuild: {
    jsxFactory: 'h',        // Use Vue's `h` function as the JSX factory
    jsxFragment: 'Fragment' // Use Vue's `Fragment` for JSX fragments
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
