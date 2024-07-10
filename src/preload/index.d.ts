import { ElectronAPI } from '@electron-toolkit/preload'

type Ipc = ModuleToIpc<typeof import('../main/ipc-handles/settings')> &
  ModuleToIpc<typeof import('../main/ipc-handles/projectManager')> &
  ModuleToIpc<typeof import('../main/ipc-handles/system')> &
  ModuleToIpc<typeof import('../main/ipc-handles/app'), 'win'>

declare global {
  interface Window {
    electron: ElectronAPI
    ipc: Ipc
  }
}

type ModuleToIpc<T, ExcludeParameters extends string = ''> = {
  [key in keyof T]: (...args: Omit<Parameters<T[Key]>, ExcludeParameters>) => ReturnType<T[key]>
}
