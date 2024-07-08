declare interface AllProjects {
  [key: string]: Project
}

declare interface Project {
  id: string
  name: string
  path: string

  // 拼音
  pinyin?: string

  // 拼音首字母
  pinyinInitial?: string

  // 需求
  requirements: ProjectItem[]
  hasRequirements: boolean
  requirementsLen: number

  // 存档
  archives: ProjectItem[]
  hasArchives: boolean
  archivesLen: number
  archivesPath?: string

  records: ProjectItem[]
}

declare interface ProjectItem {
  id: string
  name: string
  path: string
  date?: string
  parentPath: string
  isDir: boolean
  isFile: boolean
  isTopLevel: boolean
  finished?: boolean
  hasChildren?: boolean
  children?: ProjectItem[]
}

interface AppSettingWebsiteLink {
  href: string
  name: string
}
interface AppSettingWebsite {
  name: string
  links: AppSettingWebsiteLink | string
}

interface AppSettingProject {
  name: string
  path: string
}

declare interface AppData {
  settingsFile: string
}

declare interface AppSettings {
  appName: string
  websiteList: Website[]
  projectList: AppSettingProject[]
  archivesName: string
  keySearch?: string
  keyToggle?: string
  [k: string]: any
}
