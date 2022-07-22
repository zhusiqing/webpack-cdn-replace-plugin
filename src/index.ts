import type { Compiler, Stats } from 'webpack'
import { join, extname } from 'path'
import { Cache, log, cdnReplaceContentHandle } from './utils'
import type { InterfaceCDNCache } from './utils';
import ora from 'ora';

export type TypeArr = string[]
export interface InterfaceTypes {
  img: TypeArr
  font: TypeArr
  css: TypeArr
  js: TypeArr
  html: TypeArr
}
export interface InterfaceOptions {
  cache: boolean
  types: InterfaceTypes,
  uploadFn: (path: string, fileName: string) => string|Promise<string>
}

interface InterfaceNoCache {
  cacheCDN: InterfaceCDNCache<string>
  cacheFile: InterfaceCDNCache<string>
}

export class UploadPlugin {
  cache: Cache | InterfaceNoCache
  options: InterfaceOptions

  constructor(options: Partial<InterfaceOptions> = {}) {
    const types = {
      img: ['.png', '.jpg', '.jpeg', '.svg'],
      font: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
      css: ['.css'],
      js: ['.js'],
      html: ['.html']
    }
    this.options = {
      cache: true,
      uploadFn: (path, fileName) => fileName,
      ...options,
      types: { ...types, ...options.types },
    }
    this.cache = this.options.cache ? new Cache() : {
      cacheCDN: {},
      cacheFile: {}
    }
  }
  apply(compiler: Compiler) {
    compiler.hooks['done'].tapAsync('UploadPlugin', async (compilation: Stats, callback) => {
      callback()
      const { assetsInfo } = compilation.compilation
      const { types, cache: isCache } = this.options
      const imgArr: string[] = []
      const fontArr: string[] = []
      const cssArr: string[] = []
      const jsArr: string[] = []
      const htmlArr: string[] = []
      const imgFilenameObj: InterfaceCDNCache<string> = {}
      const fontFilenameObj: InterfaceCDNCache<string> = {}
      const cssFilenameObj: InterfaceCDNCache<string> = {}
      const jsFilenameObj: InterfaceCDNCache<string> = {}

      const { output } = compiler.options
      const { path, publicPath } = output
      if (publicPath) {
        log('warn', `publicPath must be emtpy, now is ${publicPath}`)
      }
      const {
        img: imgTypes,
        font: fontTypes,
        css: cssTypes,
        js: jsTypes,
        html: htmlTypes
      } = types
      // 获取上传文件
      for (const k of assetsInfo) {
        const [filename] = k
        const ext = extname(filename)
        const filePath = join(path as string as string, filename)
        if (imgTypes.includes(ext)) {
          imgArr.push(filePath)
          imgFilenameObj[filename] = filePath
        } else if (fontTypes.includes(ext)) {
          fontArr.push(filePath)
          fontFilenameObj[filename] = filePath
        } else if (cssTypes.includes(ext)) {
          cssArr.push(filePath)
          cssFilenameObj[filename] = filePath
        } else if (jsTypes.includes(ext)) {
          jsArr.push(filePath)
          jsFilenameObj[filename] = filePath
          if (isCache) {
            (<Cache>this.cache).addFile(filePath, filename)
          } else {
            this.cache.cacheFile[filePath] = filename
          }
        } else if (htmlTypes.includes(ext)) {
          htmlArr.push(filePath)
        }
      }
      const spinner = ora('uploading img and font').start()
      await this.uploadAndCacheHandle({ ...imgFilenameObj, ...fontFilenameObj })
      spinner.text = 'upload img and font is completed'
      spinner.succeed()
      const spinnerCss = ora('uploading css').start()
      // 在css文件中上传图片和字体替换
      const replaceContentHandle = cdnReplaceContentHandle(publicPath as string)
      try {
        replaceContentHandle(cssArr, { ...imgFilenameObj, ...fontFilenameObj }, { ...this.cache.cacheCDN })
      } catch (error) {
        console.error(error);
      }
      await this.uploadAndCacheHandle({ ...cssFilenameObj })
      spinnerCss.text = 'upload css is completed'
      spinnerCss.succeed()

      const spinnerJs = ora('uploading js').start()
      // 在js文件中上传图片和字体替换
      replaceContentHandle(jsArr, { ...imgFilenameObj, ...fontFilenameObj, ...cssFilenameObj }, { ...this.cache.cacheCDN})
      await this.uploadAndCacheHandle({ ...jsFilenameObj })
      spinnerJs.text = 'upload js is completed'
      spinnerJs.succeed()
      // 更新html中地址
      const cacheFile: { [key: string]: string } = {}
      Object.entries(this.cache.cacheFile).forEach(([key, value]) => {
        if (isCache) {
          cacheFile[value.fileName] = key
        } else {
          cacheFile[value] = key
        }
      })

      replaceContentHandle(htmlArr, { ...cssFilenameObj, ...cacheFile }, { ...this.cache.cacheCDN })
      // 缓存持久化
      isCache && (<Cache>this.cache).persistence()
      // callback()
    })
  }
  async uploadAndCacheHandle(obj: { [key: string] : string }) {
    const { cache, options } = this
    const arr = Object.entries(obj).map(([filename, filePath]) => ({
      filename,
      filePath
    }))
    for (const v of arr) {
      if (options.cache && (<Cache>cache).hasCDN(v.filePath)) {
        continue
      }
      try {
        const cdnUrl = await options.uploadFn(v.filePath, v.filename)
        if (options.cache && cdnUrl) {
          (<Cache>cache).addCDN(v.filePath, cdnUrl)
        } else {
          cache.cacheCDN[v.filePath] = cdnUrl
        }
      } catch (error) {
        log('error', `upload error, filename: ${v.filename},path: ${v.filePath}`)
        console.error(error);
      }

    }
  }
}
