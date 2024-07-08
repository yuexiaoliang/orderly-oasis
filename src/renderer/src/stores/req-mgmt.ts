import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

import { reqMgmt } from '@/constants'
import { useSettingStore } from '@/stores/setting'
import { bus, open } from '@/utils'

export const useReqMgmtStore = defineStore('ReqMgmt', () => {
  const settingStore = useSettingStore()
  const { settings } = storeToRefs(settingStore)

  const currentProject = useStorage('currentProject', settings.value.projectList[0])
  watch(
    () => settings.value.projectList,
    () => {
      currentProject.value = settings.value.projectList[0]
    },
    {
      immediate: true,
      deep: true
    }
  )

  const allProjects = ref<AllProjects>({})

  const projectList = computed(() => Object.values(allProjects.value))
  const projectsTotal = computed(() => projectList.value.length)

  const pinyinGroupedList = computed(() => {
    const result = projectList.value.reduce(
      (prev, curr) => {
        const { pinyinInitial } = curr

        if (curr.hasRequirements) {
          prev[reqMgmt.REQ_MGMT_SIDE_REQUIREMENTS].push({
            ...curr,
            id: `top-${curr.id}`
          })
        }

        if (!pinyinInitial) {
          prev[reqMgmt.REQ_MGMT_SIDE_OTHER].push(curr)
          return prev
        }

        if (!prev[pinyinInitial]) {
          prev[pinyinInitial] = []
        }

        prev[pinyinInitial].push(curr)

        return prev
      },
      { [reqMgmt.REQ_MGMT_SIDE_REQUIREMENTS]: [], [reqMgmt.REQ_MGMT_SIDE_OTHER]: [] } as Record<
        string,
        Project[]
      >
    )

    const lists = Object.values(result)

    lists.forEach((list) => {
      list.sort((a, b) => {
        return b.archivesLen - a.archivesLen
      })
    })

    return result
  })

  const pinyinGroupedSortedKeys = computed(() => Object.keys(pinyinGroupedList.value).sort())

  const dateGroupedList = computed(() => {
    const result: Record<string, [ProjectItem, Project][]> = {}

    projectList.value.forEach((project) => {
      const { records } = project
      records.forEach((item) => {
        const { date } = item
        if (!date) return
        const [year, month] = date.split('-')
        const d = `${year}-${month}`

        if (!result[d]) result[d] = []

        result[d].push([item, project])
      })
    })

    return result
  })

  // 全部存档数量
  const archivesTotal = computed(() => {
    return Object.values(allProjects.value).reduce((count, curr) => count + curr.archivesLen, 0)
  })

  // 全部待办数量
  const todoTotal = computed(() => {
    return Object.values(allProjects.value).reduce((count, curr) => count + curr.requirementsLen, 0)
  })

  // 全部任务数量
  const total = computed(() => {
    return todoTotal.value + archivesTotal.value
  })

  const reading = ref(false)
  const read = async () => {
    reading.value = true

    allProjects.value = await window.electron.ipcRenderer.invoke(
      'readdir',
      currentProject.value.path
    )
    reading.value = false
  }
  watch(
    currentProject,
    async (_, old) => {
      read().catch((error) => {
        if (old) {
          currentProject.value = old
        }
        ElMessage.error(error.message)
      })
    },
    {
      immediate: true,
      deep: true
    }
  )

  const refresh = async (done = () => {}) => {
    await read()
    if (typeof done === 'function') done()

    bus.emit('refresh')

    ElMessage({
      message: '刷新成功~',
      type: 'success',
      offset: 70
    })
  }

  // 做完了
  const done = async (item: ProjectItem) => {
    await ElMessageBox.confirm('确定要存档吗？', 'Warning', {
      title: '注意',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { code, msg } = await window.electron.ipcRenderer.invoke('archive-data', { ...item })

    if (code === 1) {
      ElMessage({
        type: 'error',
        message: msg,
        offset: 70
      })

      return
    }

    read()
  }

  return {
    currentProject,
    allProjects,
    projectList,
    projectsTotal,
    pinyinGroupedList,
    pinyinGroupedSortedKeys,
    dateGroupedList,
    todoTotal,
    archivesTotal,
    total,
    open,
    done,
    refresh,
    reading
  }
})
