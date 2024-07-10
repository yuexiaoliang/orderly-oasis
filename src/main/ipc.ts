import { BrowserWindow, ipcMain } from 'electron'
import * as settingsIpc from './ipc-handles/settings'
import * as projectManagerIpc from './ipc-handles/projectManager'
import * as systemIpc from './ipc-handles/system'
import * as appIpc from './ipc-handles/app'

async function handlesRegister(module: Record<string, any>, win?: BrowserWindow) {
  const keys = Object.keys(module)
  keys.forEach((key) => {
    ipcMain.handle(key, (_, ...args) => {
      if (win) module[key](win, ...args)
      return module[key](...args)
    })
  })
}

export default (win: BrowserWindow) => {
  handlesRegister(settingsIpc)
  handlesRegister(projectManagerIpc)
  handlesRegister(systemIpc)
  handlesRegister(appIpc, win)
}
