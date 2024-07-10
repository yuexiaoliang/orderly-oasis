import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'path'
import { merge } from 'lodash'

const appName = app?.getName()
const homePath = app?.getPath('home')
const appDataPath = app?.getPath('appData')

async function updateAppData(data: AppData) {
  const appDataFile = join(appDataPath, `.${appName}`)

  const appData = getAppData()

  await writeFile(appDataFile, JSON.stringify(merge(appData, data)), 'utf-8')
}

function getAppData() {
  const appDataFile = join(appDataPath, `.${appName}`)

  let appData: AppData = {
    settingsFile: join(homePath, `.${appName}.json`)
  }

  if (existsSync(appDataFile)) {
    appData = JSON.parse(readFileSync(appDataFile, 'utf-8'))
  } else {
    writeFileSync(appDataFile, JSON.stringify(appData))
  }

  return appData
}

export async function updateSettings(newSettings: Partial<AppSettings & AppData>) {
  const { settingsFile, ...rest } = newSettings

  if (settingsFile) {
    await updateAppData({ settingsFile })
  }

  if (Object.keys(rest).length) {
    const { settingsFile, ...__settings } = getSettings().data

    const _settings = { ...__settings, ...rest }

    await writeFile(settingsFile, JSON.stringify(_settings), 'utf-8')
  }

  return getSettings()
}

export function getSettings() {
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
    code: 0,
    data: {
      ...settings,
      ...appData
    }
  }
}
