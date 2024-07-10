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

  const addProject = async () => {
    const { filePaths } = await window.electron.ipcRenderer.invoke('open-dialog', {
      properties: ['openDirectory'],
      title: '请选择要管理的目录',
      parsed: true
    })
    if (!filePaths.length) return

    const [dir] = filePaths

    const { value: name } = await ElMessageBox.prompt('请输入项目名称', '项目名称', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: dir.name
    })

    try {
      const { code, msg } = await window.electron.ipcRenderer.invoke('add-project', {
        name,
        path: dir.path
      })

      if (code !== 0) throw msg

      getSettings()
      ElMessage.success(msg)
    } catch (error) {
      ElMessage.error(error!.toString())
    }
  }

  const deleteProject = async (project: AppSettingProject) => {
    const { name } = project
    try {
      const { code, msg } = await window.electron.ipcRenderer.invoke('delete-project', name)

      if (code !== 0) throw msg

      getSettings()
      ElMessage.success(msg)
    } catch (error) {
      ElMessage.error(error!.toString())
    }
  }

  return {
    settings,
    getSettings,
    deleteProject,
    addProject
  }
})
