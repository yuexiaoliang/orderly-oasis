import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<AppSettings & AppData>({
    appName: '',
    archivesName: '',
    settingsFile: '',
    websiteList: [],
    projectList: []
  })

  const getSettings = async () => {
    settings.value = await window.electron.ipcRenderer.invoke('get-settings')
  }

  return {
    settings,
    getSettings
  }
})
