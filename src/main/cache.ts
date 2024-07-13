import { join } from 'node:path'
import { readdir, writeFile } from 'node:fs/promises'
import { app } from 'electron'
import { ClassicLevel } from 'classic-level'
import { get as _get, set as _set, unset as _unset } from 'lodash'
import { getAppCacheDir } from './ipc-handles/settings'
import { isDir, pathToSegments, testIgnore } from './utils'

export const DEPTH = 3
export const CATCH_KEY = 'cache'

type PathData = {
  /**
   * 如果值为 true 则表示该路径为文件夹，否则表示该路径为文件
   */
  [key: string]: PathData | null
}

let db: ClassicLevel<string, PathData>

export function createCacheDB() {
  if (!db || db.status !== 'opening') {
    if (!db) {
      db = new ClassicLevel(getAppCacheDir(), {
        valueEncoding: 'json'
      })
    }

    if (db.status !== 'opening') {
      db.open(() => {
        console.log('Cache database opened!')
      })
    }

    db.on('opening', async () => {
      console.log('Cache database opening!')
      db.get(CATCH_KEY).catch((err) => {
        if (err.code === 'LEVEL_NOT_FOUND') {
          db.put(CATCH_KEY, {})
        }
      })
    })

    app.on('quit', async () => {
      db.close(() => {
        console.log('Cache database closed!')
      })
    })
  }

  async function dirToPathData(path: string, parent: PathData, depth: number) {
    if (depth > DEPTH) return parent
    if (testIgnore(path)) return parent

    const children = await readdir(path, { withFileTypes: true })

    await Promise.all(
      children
        .filter((child) => !testIgnore(join(path, child.name)))
        .map(async (child) => {
          const { name } = child

          const childPath = join(path, name)

          if (child.isDirectory()) {
            if (!parent[childPath]) parent[childPath] = {}

            await dirToPathData(childPath, parent[childPath], depth + 1)
          } else {
            parent[childPath] = null
          }
        })
    )

    return parent
  }

  async function saveDir(path: string) {
    const data = await db.get(CATCH_KEY)
    _set(data, pathToSegments(path), await dirToPathData(path, data, 0))
    await db.put(CATCH_KEY, data)

    saveDatabaseToJson()
  }

  async function saveDirs(paths: string[]) {
    // 进行一次排序，原因如下：
    // 当 paths 中包含后代关系的时候，
    // 如：['a/b/c/d/e/f', 'a/b/']
    // 这时候如果先写入深层路径，然后写入浅层路径，
    // 则会导致最深路径被覆盖，从而导致数据丢失
    paths.sort((a, b) => a.length - b.length)

    const data = await db.get(CATCH_KEY)

    let batchOperation = db.batch()

    for (const path of paths) {
      _set(data, pathToSegments(path), await dirToPathData(path, {}, 0))
      batchOperation = batchOperation.put(CATCH_KEY, data)
    }

    await batchOperation.write()

    saveDatabaseToJson()
  }

  async function saveDatabaseToJson() {
    try {
      const data = await get()

      await writeFile(join(getAppCacheDir(), 'cache.json'), JSON.stringify(data, null, 2))
    } catch (error) {
      console.log(`🚀 > saveDatabaseToJson > error:`, error)
    }
  }

  async function get(path?: string) {
    const data = await db.get(CATCH_KEY)
    if (!path) return data

    return _get(data, pathToSegments(path))
  }

  async function set(path: string) {
    const data = await db.get(CATCH_KEY)
    _set(data, pathToSegments(path), isDir(path))

    await db.put(CATCH_KEY, data)
    saveDatabaseToJson()
  }

  async function del(path: string) {
    const data = await db.get(CATCH_KEY)
    _unset(data, pathToSegments(path))

    await db.put(CATCH_KEY, data)
    saveDatabaseToJson()
  }

  async function clear() {
    await db.clear()

    await db.put(CATCH_KEY, {})
    saveDatabaseToJson()
  }

  return {
    db,
    get,
    set,
    del,
    clear,
    saveDir,
    saveDirs
  }
}
