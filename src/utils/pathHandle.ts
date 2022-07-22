import { join, extname } from 'path';
import { read, write } from './io'
import { InterfaceCDNCache } from './cache';
import { log } from './console';
import { regExpCssStaticPath } from './regExp'

export const publicPathHandle = (publicPath: string) => (content: string) => {
  const DEFAULT_SEP = '/'
  // match strictly
  const escapedSeparator = `\\${DEFAULT_SEP}`
  let regStr = publicPath
    .split(DEFAULT_SEP)
    .filter((item) => !!item)
    .map((part) => {
      if (/\./.test(part)) {
        return part.replace(/\.+/g, (match) =>
          match
            .split('')
            .map((dot) => '\\' + dot)
            .join('')
        )
      }
      return part
    })
    .join(escapedSeparator)
  // absolute publicPath
  if (publicPath.startsWith(DEFAULT_SEP)) {
    let prefix = ''
    const publicPathArray = publicPath.split('')
    while (publicPathArray.length) {
      const char = publicPathArray.shift()
      if (char === DEFAULT_SEP) {
        prefix += escapedSeparator
      } else {
        break
      }
    }
    regStr = `${prefix}${regStr}`
  }
  // avoid matching url in form of `//path/to/resource`
  // aka url which drop the protocol part
  if (publicPath.endsWith(DEFAULT_SEP)) {
    regStr += '([^/])'
  }
  const refinedRegStr = `([(=]['"]?)${regStr}`
  const reg = new RegExp(refinedRegStr, 'g')
  return content.replace(reg, (_, prefix, suffix) => {
    let result = ''
    if (prefix) {
      result = `${prefix}${result}`
    }
    // suffix possibly is offset , assertion type
    if (suffix && typeof suffix !== 'number') {
      result += suffix
    }
    return result
  })
}

export const cdnReplaceContentHandle = (publicPath: string) => (arr: string[], fileNameObj: InterfaceCDNCache<string>, cdnArr: InterfaceCDNCache<string>) => {
  const removePublicPath = publicPathHandle(publicPath)
  const prefix = publicPath || ''
  for (const v of arr) {
    const content = removePublicPath(read(v))
    const fileType = extname(v)
    let newContent = content
    let matchArr: string[] = []
    if (fileType === '.css') {
      matchArr = newContent.match(regExpCssStaticPath) || []
    }

    Object.entries(fileNameObj).forEach(([filename, filePath]) => {
      const cdnPath = cdnArr[filePath]
      if (cdnPath) {
        try {
          if (/^http:\/\/|https:\/\//.test(cdnPath)) {
            // 当publicPath为空时，css文件会采用相对路径，这里用于替换
            if (matchArr.length) {
              const find = matchArr.find(el => el.indexOf(filename) !== -1)
              if (find) {
                newContent = newContent.replace(find, cdnPath)
              }

            } else {
              const replaceStr = join(prefix, filename)
              const reg = new RegExp(replaceStr, 'g')
              newContent = newContent.replace(reg, cdnPath);
            }
          } else {
            const reg = new RegExp(filename, 'g')
            newContent = newContent.replace(reg, cdnPath);
          }
        } catch (error) {
          log('error', 'cdnReplaceContentHandle error')
          console.error(error);
        }
      }
    })
    write(v, newContent)
  }
}


