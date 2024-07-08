import bus from '@/utils/bus'
import { useDark } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark({
    disableTransition: true
  })

  const toggleDark = (val: any) => {
    isDark.value = val
    bus.emit('toggle-dark', val)
  }

  return {
    isDark,
    toggleDark
  }
})
