import { Menu, Tray, globalShortcut, app, shell, BrowserWindow } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { optimizer, is } from '@electron-toolkit/utils'
import registerIpc from './ipc'

import icon from '@resources/icon.png?asset'

if (release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// 设置应用程序开机自启动
app.setLoginItemSettings({
  openAtLogin: true
})

let win: BrowserWindow | null = null
let appIcon: Tray | null = null
const preload = join(__dirname, '../preload/index.js')
const url = process.env['ELECTRON_RENDERER_URL']
const indexHtml = join(__dirname, '../renderer/index.html')

function createWindow(): void {
  win = new BrowserWindow({
    title: 'OrderlyOasis',
    icon,
    titleBarStyle: 'hidden',
    transparent: true,
    resizable: false,
    frame: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    },
    width: 1000 + (is.dev ? 400 : 0),
    height: 720,
    center: true
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && url) {
    win.loadURL(url)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// 托盘菜单
function createTray() {
  appIcon = new Tray(icon)
  appIcon.setToolTip('OrderlyOasis')

  appIcon.on('click', () => {
    if (!win?.isVisible()) win?.show()
  })

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: () => {
        win?.close()
      }
    }
  ])
  appIcon.setContextMenu(contextMenu)
}

// 全局快捷键
function createGlobalShortcut() {
  globalShortcut.register('Alt+W', () => {
    !win?.isVisible() ? win?.show() : win?.hide()
  })
}
app.commandLine.appendSwitch('wm-window-animations-disabled')
app.whenReady().then(() => {
  createWindow()
  createTray()
  createGlobalShortcut()

  registerIpc(win!)
})

app.on('browser-window-created', (_, window) => {
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  optimizer.watchWindowShortcuts(window)
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
