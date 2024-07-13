import { parse, relative } from 'node:path'
import fs from 'node:fs'
import ignore from 'ignore'

export function pathToSegments(path: string) {
  const segments: string[] = []
  const root = parse(path).root

  // eslint-disable-next-line no-constant-condition
  while (true) {
    segments.unshift(path)

    if (path === root) break

    path = parse(path).dir
  }

  return segments
}

export function isDir(path: string) {
  return fs.statSync(path).isDirectory()
}

export function testIgnore(path: string) {
  const ig = ignore().add(['node_modules', '.git'])
  return ig.ignores(relative(parse(path).root, path))
}
