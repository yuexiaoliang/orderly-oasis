import { parse } from 'path'
import { dialog, shell, type OpenDialogSyncOptions } from 'electron'

export async function openDialog(options: OpenDialogSyncOptions & { parsed?: boolean }) {
  const res = await dialog.showOpenDialog(options)

  if (!options.parsed) return { code: 0, data: res }

  const { filePaths, ...rest } = res

  return {
    code: 0,
    data: {
      ...rest,
      filePaths: filePaths.map((path) => {
        return {
          ...parse(path),
          path
        }
      })
    }
  }
}

export async function openPath(path: string) {
  await shell.openPath(path)
  return { code: 0 }
}
