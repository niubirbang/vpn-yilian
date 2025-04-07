import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from "vite-plugin-html"

const getViteEnv = (mode, target) => {
  return loadEnv(mode, process.cwd())[target]
}

export default ({ mode }) => defineConfig({
  base: './',
  server: {
    port: 10001,
    server: "127.0.0.1",
  },
  plugins: [
    vue(),
    createHtmlPlugin({
      inject: {
        data: {
          title: getViteEnv(mode, "VITE_APP_TITLE"),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../window'
  },
})