import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VChart from 'vue-echarts'
import 'echarts'

import App from './App.vue'
import 'normalize.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './variables.css'
import './base.scss'
import { useSettingStore } from '@/stores/setting'

Object.keys(window.ipc).forEach((funcName) => {
  window.ipc[funcName] = codeInterceptor(window.ipc[funcName])
})

mounter()
async function mounter() {
  const app = createApp(App)

  app.use(createPinia())

  await useSettingStore().getSettings()

  app.component('VChart', VChart)

  app.mount('#app').$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
}

function codeInterceptor(originalFunction) {
  return async function (...args) {
    try {
      const result = await originalFunction(...args)

      if (result?.code !== 0) {
        throw result?.msg
      }

      return result
    } catch (error) {
      ElMessage.error(error?.toString())
      throw error
    }
  }
}
