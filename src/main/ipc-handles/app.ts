import { BrowserWindow } from 'electron'

export function hideAppWindow(win?: BrowserWindow) {
  win?.hide()
  return { code: 0 }
}

export function showAppWindow(win?: BrowserWindow) {
  win?.show()
  return { code: 0 }
}

export function minimizeAppWindow(win?: BrowserWindow) {
  win?.minimize()
  return { code: 0 }
}

export function maximizeAppWindow(win?: BrowserWindow) {
  win?.maximize()
  return { code: 0 }
}

export function unmaximizeAppWindow(win?: BrowserWindow) {
  win?.unmaximize()
  return { code: 0 }
}
