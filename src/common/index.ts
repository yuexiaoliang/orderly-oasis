import { pinyin } from 'pinyin-pro'

export function getFileName(name: string) {
  const reg = /((Empty-)*[a-zA-Z]*-+)(?<name>.*)/i
  const exec = reg.exec(name)
  const newName = exec?.groups?.name

  return newName ? newName : name
}

export function extractDate(input: string) {
  const datePattern = /(\d{4}[-/]?)(\d{1,2}[-/]?)(\d{1,2})/

  // 使用正则表达式进行匹配
  const match = input.match(datePattern)
  if (!match) return

  // 如果匹配成功，根据匹配到的分组重新组合成标准的 YYYY-MM-DD 格式
  const year = match[1].replace(/-/g, '').replace('/', '')
  const month = match[2].replace(/-/g, '').replace('/', '').padStart(2, '0')
  const day = match[3].replace(/-/g, '').replace('/', '').padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function addPinyin<T extends Record<string, any>>(obj: T) {
  const name = obj.name

  // 拼音
  const py = pinyin(name, { type: 'string', toneType: 'none', separator: '' })
  // 首字母
  const first = pinyin(name, {
    pattern: 'first',
    nonZh: 'consecutive',
    type: 'string',
    separator: ''
  })

  const _py = [py, first]

  return {
    ...obj,
    pinyin: _py.map((e) => e.toLowerCase()),
    pinyinInitial: first.at(0)?.toUpperCase()
  }
}

export function addPinyinForList(list: any) {
  if (!Array.isArray(list)) return []
  return list.map((item: any) => addPinyin(item))
}
