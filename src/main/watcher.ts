import { app } from 'electron'
import chokidar, { type FSWatcher } from 'chokidar'
import { createCacheDB, DEPTH } from './cache'

import { getSettings, getAppDataFile, getAppCacheDir } from './ipc-handles/settings'
import { testIgnore } from './utils'
import { is } from '@electron-toolkit/utils'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const db = createCacheDB()

app.on('will-finish-launching', async () => {
  startWatcher()
})

app.on('quit', () => {
  clearWatcher()
})

/**
 * getAppDataFile() 变化监听器
 */
let appDataFileWatcher: FSWatcher | null = null

/**
 * 应用配置文件变化监听器
 */
let settingsFileWatcher: FSWatcher | null = null

/**
 * 项目变化监听器
 * 项目为 `settings.projectList` 中配置的路径
 */
let projectsWatcher: FSWatcher | null = null

export async function startWatcher() {
  startAppDataFileWatcher()
  startSettingsFileWatcher()
  startProjectsWatcher()
}

export async function clearWatcher() {
  closeAppDataFileWatcher()
  closeSettingsFileWatcher()
  closeProjectsWatcher()
}

async function startAppDataFileWatcher() {
  if (appDataFileWatcher) return

  appDataFileWatcher = await createWatcher(getAppDataFile())
  appDataFileWatcher.on('change', async () => {
    closeSettingsFileWatcher().then(() => {
      startSettingsFileWatcher()
    })
    closeProjectsWatcher().then(() => {
      startProjectsWatcher()
    })
  })
}

async function closeAppDataFileWatcher() {
  await appDataFileWatcher?.close()
  appDataFileWatcher = null
}

async function startSettingsFileWatcher() {
  if (settingsFileWatcher) return

  const { data: settings } = getSettings()
  const { settingsFile } = settings

  if (settingsFile) {
    settingsFileWatcher = await createWatcher(settingsFile)
    settingsFileWatcher.on('change', async () => {
      await closeProjectsWatcher()
      startProjectsWatcher()
    })
  }
}

async function closeSettingsFileWatcher() {
  await settingsFileWatcher?.close()
  settingsFileWatcher = null
}

async function startProjectsWatcher() {
  if (projectsWatcher) return

  const { data: settings } = getSettings()
  const { projectList } = settings
  const paths = projectList.map((item) => item.path).filter((p) => existsSync(p))

  await db.clear()
  await db.saveDirs(paths)

  if (paths.length > 0) {
    projectsWatcher = await createWatcher(paths, { depth: DEPTH })
    projectsWatcher.on('all', async (event, path) => {
      if (['unlink', 'unlinkDir'].includes(event)) {
        await db.del(path)
      }

      if (['add', 'addDir'].includes(event)) {
        await db.set(path)
      }
    })
  }

  if (is.dev) {
    writeFile(
      join(getAppCacheDir(), 'watched.json'),
      JSON.stringify(
        {
          projectsWatcher: projectsWatcher?.getWatched(),
          settingsFileWatcher: settingsFileWatcher?.getWatched(),
          appDataFileWatcher: appDataFileWatcher?.getWatched()
        },
        null,
        2
      )
    )
  }
}

async function closeProjectsWatcher() {
  await projectsWatcher?.close()
  projectsWatcher = null
}

type WatchParams = Parameters<typeof chokidar.watch>
function createWatcher(paths: WatchParams['0'], options: WatchParams['1'] = {}) {
  return new Promise<FSWatcher>((resolve, reject) => {
    const watcher = chokidar.watch(paths, {
      ignored(str) {
        return testIgnore(str)
      },
      ...options
    })

    watcher.on('ready', () => {
      resolve(watcher)
    })

    watcher.on('error', (err) => {
      reject(err)
    })
  })
}
