import { resolve } from 'path'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main'
    },
    resolve: {
      alias: {
        '@common': resolve(__dirname, 'src/common'),
        '@resources': resolve(__dirname, 'resources')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload'
    },
    resolve: {
      alias: {
        '@common': resolve(__dirname, 'src/common'),
        '@resources': resolve(__dirname, 'resources')
      }
    }
  },
  renderer: {
    build: {
      outDir: 'dist/renderer'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@common': resolve(__dirname, 'src/common'),
        '@resources': resolve(__dirname, 'resources')
      }
    },
    plugins: [
      vueDevTools(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
})
