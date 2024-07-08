import { BrowserWindow, app, ipcMain, shell, dialog, OpenDialogSyncOptions } from 'electron'
import { Dirent, existsSync, readFileSync, writeFileSync } from 'fs'
import { mkdir, readdir, rename, writeFile } from 'node:fs/promises'
import { join } from 'path'
import { v4 as uuid } from 'uuid'
import { merge } from 'lodash'
import { addPinyin, extractDate, getFileName } from '@common/index'

export default (win: BrowserWindow) => {
  const appName = app.getName()
  let settings: AppSettings & AppData = getSettingsSync()

  ipcMain.on('open', (_, path: string) => {
    shell.openPath(path)
  })

  ipcMain.on('close-win', () => {
    win?.hide()
  })

  ipcMain.on('minimize-win', () => {
    win?.minimize()
  })

  ipcMain.on('maximize-win', () => {
    win?.maximize()
  })

  ipcMain.on('unmaximize-win', () => {
    win?.unmaximize()
  })

  ipcMain.handle('open-dialog', async (_, options: OpenDialogSyncOptions) => {
    return await dialog.showOpenDialog(win, options)
  })

  ipcMain.handle('get-settings', () => {
    settings = getSettingsSync()
    return settings
  })

  ipcMain.handle('update-settings', (_, settings: Partial<AppSettings>) => {
    return updateSettings(settings)
  })

  ipcMain.handle('readdir', (_, dir: string) => {
    return read(dir)
  })

  ipcMain.handle('readdir-children', (_, path: string) => {
    return readdirChildren(path)
  })

  ipcMain.handle('archive-data', async (_, item: ProjectItem) => {
    const { parentPath, path, name, isDir } = item

    const fileServe = join(parentPath, settings['archivesName'])
    const newPath = join(fileServe, name)

    if (existsSync(newPath)) {
      return {
        code: 1,
        msg: `存档目录已有同名文件${isDir ? '夹' : ''}`
      }
    }

    if (!existsSync(fileServe)) {
      await mkdir(fileServe)
    }

    await rename(path, newPath)

    return {
      code: 0,
      msg: '存档成功'
    }
  })

  async function updateSettings(newSettings: Partial<AppSettings & AppData>) {
    const { settingsFile, ...rest } = newSettings

    if (settingsFile) {
      await updateAppData({ settingsFile })
      settings = getSettingsSync()
    }

    if (Object.keys(rest).length) {
      const { settingsFile, ...__settings } = settings

      const _settings = merge({}, __settings, rest)

      await writeFile(settingsFile, JSON.stringify(_settings), 'utf-8')

      settings = getSettingsSync()
    }

    return {
      code: 0,
      data: settings
    }
  }

  function getSettingsSync(): AppSettings & AppData {
    const appData: AppData = getAppData()

    const defaultSettings: AppSettings = {
      appName,
      archivesName: '.存档',
      websiteList: [
        {
          name: '百度',
          links: [
            { name: '官网', href: 'https://baidu.com' },
            { name: '开发者', href: 'https://kaifa.baidu.com' }
          ]
        },
        {
          name: 'Google',
          links: 'https://baidu.com'
        }
      ],
      projectList: [],
      keySearch: 'Ctrl + F',
      keyToggle: 'Alt + W'
    }

    let settings: AppSettings = {
      ...defaultSettings
    }

    const settingsFile = appData.settingsFile

    if (existsSync(settingsFile)) {
      settings = merge(settings, JSON.parse(readFileSync(settingsFile, 'utf-8')))
    } else {
      writeFileSync(settingsFile, JSON.stringify(settings), 'utf-8')
    }

    return {
      ...settings,
      ...appData
    }
  }

  function getAppData() {
    const home = app.getPath('home')
    const appDataFile = join(app.getPath('appData'), `.${appName}`)

    let appData: AppData = {
      settingsFile: join(home, `.${appName}.json`)
    }

    if (existsSync(appDataFile)) {
      appData = JSON.parse(readFileSync(appDataFile, 'utf-8'))
    } else {
      writeFileSync(appDataFile, JSON.stringify(appData))
    }

    return appData
  }

  async function updateAppData(data: AppData) {
    const appDataFile = join(app.getPath('appData'), `.${appName}`)

    const appData = getAppData()

    await writeFile(appDataFile, JSON.stringify(merge(appData, data)), 'utf-8')
  }

  async function read(reqDir: string) {
    if (!existsSync(reqDir)) {
      throw new Error(`${reqDir} not found`)
    }

    const projects: AllProjects = {}

    const projectsDirs = (await readdir(reqDir, { withFileTypes: true })).filter((e) =>
      e.isDirectory()
    )

    await Promise.all(
      projectsDirs.map(async (dir) => {
        let projectPath = join(reqDir, dir.name)

        const projectChildren = await readdir(projectPath, { withFileTypes: true })

        // 是否有存档
        const hasArchives = projectChildren
          .find((el) => el.name === settings['archivesName'])
          ?.isDirectory()

        // 待办需求
        const requirements = projectChildren.filter((el) => el.name !== settings['archivesName'])

        // 根据是否有待办需求重命名文件夹，添加不同的前缀
        const projectName = await renameProjectDir(
          projectPath,
          dir.name,
          requirements.length ? 'A-' : 'Z-'
        )

        projectPath = join(reqDir, projectName)

        projects[projectName] = addPinyin<Project>({
          id: projectName,
          name: getFileName(projectName),
          path: projectPath,
          requirements: [],
          requirementsLen: 0,
          hasRequirements: false,
          archives: [],
          archivesLen: 0,
          hasArchives: false,
          records: []
        })
        const project = projects[projectName]

        // 需求
        if (requirements.length) {
          const items = filesToItems(requirements, projectPath, true)
          const len = items.length

          project.requirements = items
          project.requirementsLen = len
          project.hasRequirements = len > 0
        }

        // 存档
        if (hasArchives) {
          const archivePath = join(projectPath, settings['archivesName'])

          const items = await readdirChildren(archivePath, (item) => {
            return {
              ...item,
              parent: project,
              isTopLevel: true,
              finished: true
            }
          })
          const len = items.length

          project.archives = items
          project.archivesLen = len
          project.hasArchives = len > 0
          project.archivesPath = archivePath
        }

        project.records = project.requirements.concat(project.archives)
      })
    )

    return projects

    async function renameProjectDir(oldPath: string, name: string, prefix: string) {
      const newName = `${prefix}${getFileName(name)}`
      const newPath = join(reqDir, newName)

      if (oldPath === newPath) return newName

      await rename(oldPath, newPath)

      return newName
    }
  }
}

function fileToItem(file: Dirent, parentPath: string, isTopLevel: boolean = false): ProjectItem {
  const isDir = file.isDirectory()
  return {
    id: uuid(),
    name: file.name,
    date: extractDate(file.name),
    path: join(parentPath, file.name),
    parentPath,
    isDir,
    isFile: file.isFile(),
    hasChildren: isDir,
    isTopLevel
  }
}

function filesToItems(
  files: Dirent[],
  parentPath: string,
  isTopLevel: boolean = false
): ProjectItem[] {
  return files.map((file) => fileToItem(file, parentPath, isTopLevel))
}

export async function readdirChildren(
  path: string,
  handle?: (item: ProjectItem) => ProjectItem | Promise<ProjectItem>
): Promise<ProjectItem[]> {
  const files = await readdir(path, { withFileTypes: true })

  return await Promise.all(
    files.map(async (child) => {
      const result = fileToItem(child, path)

      if (typeof handle === 'function') {
        return await handle(result)
      }

      return result
    })
  )
}
