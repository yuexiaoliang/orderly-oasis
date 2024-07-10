import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as settingsIpcHandles from '../main/ipc-handles/settings'
import * as projectManagerIpc from '../main/ipc-handles/projectManager'
import * as systemIpc from '../main/ipc-handles/system'
import * as appIpc from '../main/ipc-handles/app'

const ipcAPI = {}
function handlesRegister(module: Record<string, any>) {
  const keys = Object.keys(module)
  keys.forEach((key) => {
    ipcAPI[key] = (...args) => ipcRenderer.invoke(key, ...args)
  })
}
handlesRegister(settingsIpcHandles)
handlesRegister(projectManagerIpc)
handlesRegister(systemIpc)
handlesRegister(appIpc)

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)

    contextBridge.exposeInMainWorld('ipc', ipcAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as any).electron = electronAPI
  ;(window as any).ipc = ipcAPI
}

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  // @ts-ignore ignore
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child)
    }
  },

  // @ts-ignore ignore
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child)
    }
  }
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const oStyle = document.createElement('style')
  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = `
  .app-loading-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spinner {
    position: relative;
    width: 10px;
    height: 10px;
  }

  .cube1, .cube2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background-color: var(--el-color-warning);
    animation: sk-cubemove 1.8s infinite ease-in-out;
  }

  .cube2 {
    background-color: #0048e1;
    animation-delay: -0.9s;
  }

  @keyframes sk-cubemove {
    25% {
      transform: translateX(25px) rotate(-90deg) scale(0.5);
    } 50% {
      transform: translateX(25px) translateY(25px) rotate(-179deg);
    } 50.1% {
      transform: translateX(25px) translateY(25px) rotate(-180deg);
    } 75% {
      transform: translateX(0px) translateY(25px) rotate(-270deg) scale(0.5);
    } 100% {
      transform: rotate(-360deg);
    }
  }`

  const oDiv = document.createElement('div')
  oDiv.className = 'app-loading-wrap'
  oDiv.id = 'app'
  oDiv.innerHTML = `<div class="spinner">
    <div class="cube1"></div>
    <div class="cube2"></div>
  </div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },

    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    }
  }
}
