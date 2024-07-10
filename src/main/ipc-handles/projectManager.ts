import { Dirent, existsSync } from 'node:fs'
import { mkdir, readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { v4 as uuid } from 'uuid'
import { getSettings, updateSettings } from './settings'
import { addPinyin, extractDate } from '@common/index'

export async function archiveProjectData(item: ProjectItem) {
  const { data: settings } = getSettings()

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
}

export async function getProjectItemChildren(
  path: string,
  handle?: (item: ProjectItem) => ProjectItem | Promise<ProjectItem>
) {
  const files = await readdir(path, { withFileTypes: true })

  const data = await Promise.all(
    files.map(async (child) => {
      const result = fileToItem(child, path)

      if (typeof handle === 'function') {
        return await handle(result)
      }

      return result
    })
  )

  return {
    code: 0,
    data
  }
}

export async function getProject(reqDir: string) {
  if (!existsSync(reqDir)) {
    throw new Error(`${reqDir} not found`)
  }

  const { data: settings } = getSettings()
  const projects: AllProjects = {}

  const projectsDirs = (await readdir(reqDir, { withFileTypes: true })).filter((e) =>
    e.isDirectory()
  )

  await Promise.all(
    projectsDirs.map(async (dir) => {
      const projectPath = join(reqDir, dir.name)
      const projectName = dir.name

      const projectChildren = await readdir(projectPath, { withFileTypes: true })

      // 是否有存档
      const hasArchives = projectChildren
        .find((el) => el.name === settings['archivesName'])
        ?.isDirectory()

      // 待办需求
      const requirements = projectChildren.filter((el) => el.name !== settings['archivesName'])

      projects[projectName] = addPinyin<Project>({
        id: projectName,
        name: projectName,
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

        const { data: items } = await getProjectItemChildren(archivePath, (item) => {
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

  return {
    code: 0,
    data: projects
  }
}

export async function deleteProject(name: AppSettingProject['name']) {
  const { data: settings } = getSettings()
  const { projectList } = settings

  const index = projectList.findIndex((item) => item.name === name)

  if (index === -1) {
    return {
      code: 1,
      msg: '存档目录不存在'
    }
  }

  projectList.splice(index, 1)

  await updateSettings({
    projectList
  })

  return {
    code: 0,
    msg: '删除成功'
  }
}

export async function addProject(project: AppSettingProject) {
  const { data: settings } = getSettings()
  const { projectList } = settings
  const checkName = projectList.some((item) => item.name === project.name)
  if (checkName) {
    return {
      code: 1,
      msg: '项目名称重复'
    }
  }
  const checkPath = projectList.find((item) => item.path === project.path)

  if (checkPath) {
    return {
      code: 1,
      msg: `项目路径和 [${checkPath.name}] 重复`
    }
  }

  projectList.push(project)

  await updateSettings({
    projectList
  })

  return {
    code: 0,
    msg: '添加成功'
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
