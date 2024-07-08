import bus from './bus'

export { bus }

// 打开文件或文件夹
export function open(path: string) {
  window.electron.ipcRenderer.send('open', path)
}

export function selectFilter(val: string, list: any[]) {
  const result = list.filter((item: any) => {
    const { pinyin } = item
    return pinyin.some((py: string) => py.includes(val)) || item.name.includes(val)
  })

  return result
}

export function getCssVariable(variable: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable)
}
