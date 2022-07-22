import {
  ArrayBufferView,
  readFileSync,
  writeFileSync,
  ensureFileSync
} from 'fs-extra';

export const read = (path: string) => readFileSync(path, { encoding: 'utf-8' })

export const write = (path: string, content: string| ArrayBufferView) => writeFileSync(path, content)

export const ensure = (path: string) => ensureFileSync(path)
