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
    const { data } = await window.ipc.getSettings()
    settings.value = data
  }

  const addProject = async () => {
    const {
      data: { filePaths }
    } = await window.ipc.openDialog({
      properties: ['openDirectory'],
      title: '请选择要管理的目录',
      parsed: true
    })
    if (!filePaths.length) return

    const [dir] = filePaths

    if (typeof dir === 'string') return

    const { value: name } = await ElMessageBox.prompt('请输入项目名称', '项目名称', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: dir.name
    })

    try {
      const { code, msg } = await window.ipc.addProject({
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
      const { code, msg } = await window.ipc.deleteProject(name)

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
