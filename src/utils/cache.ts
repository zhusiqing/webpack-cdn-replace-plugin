import { join } from 'path'
import { read, write, ensure } from './io'

const CACHE_FILE = 'cache.json'
const CACHE_FILE_PATH = join(__dirname, `../${CACHE_FILE}`)
const CACHE_TIME = 1e3 * 60 * 60 * 24 // 一天
const CACHE_FILE_TIME = 1e3 * 60 *30 // 半小时

interface InterfaceChildFileCache {
  time: number,
  fileName: string
}

export interface InterfaceCDNCache<T = string> {
  [key: string]: T
}

export interface InterfaceFileCache {
  [key: string]: InterfaceChildFileCache
}

export interface InterfaceCache {
  // 上传后cdn地址和原文件地址
  cacheCDN: InterfaceCDNCache
  // 要替换文件成cdn的原文件地址和过期时间
  cacheFile: InterfaceFileCache
  // 整个缓存文件时间
  lastCacheTime: number
}

export class Cache {
  cache: InterfaceCache = {
    cacheCDN: {},
    cacheFile: {},
    lastCacheTime: Date.now()
  }
  cacheCDN: InterfaceCDNCache = {}
  cacheFile: InterfaceFileCache = {}
  cachePath: string
  constructor(cachePath = CACHE_FILE_PATH) {
    this.cachePath = cachePath
    this.init()
  }
  init() {
    const time = Date.now()
    const _this = this
    ensure(_this.cachePath)
    let cacheCDN: InterfaceCDNCache = {}
    let cacheFile: InterfaceFileCache = {}
    let cacheParse: InterfaceCache = {
      cacheCDN,
      cacheFile,
      lastCacheTime: time
    }
    if (time - _this.cache.lastCacheTime <= CACHE_TIME) {
      const cacheJson = read(_this.cachePath) || '{}'
      cacheParse = JSON.parse(cacheJson)
      cacheCDN = cacheParse.cacheCDN || {}
      cacheFile = cacheParse.cacheFile || {}
    }

    Object.entries(cacheCDN).forEach(([k, v]) => {
      cacheCDN[k] = v
    })
    Object.entries(cacheFile).forEach(([k, v]) => {
      // 缓存时间是为了解决vue-cli的二次构建问题
      if (time - v.time <= CACHE_FILE_TIME) {
        cacheFile[k] = v
      }
    })

    this.cacheCDN = cacheCDN
    this.cacheFile = cacheFile
    this.cache = {
      cacheCDN,
      cacheFile,
      lastCacheTime: time
    }
  }
  persistence() {
    const cacheJson = JSON.stringify(this.cache)
    write(this.cachePath, cacheJson)
  }
  clear() {

  }
  addCDN(key: string, value: string) {
    this.cacheCDN[key] = value
    return this.cacheCDN
  }
  getCDN(key: string) {
    return this.cacheCDN[key]
  }
  hasCDN(key: string) {
    return this.cacheCDN.hasOwnProperty(key)
  }
  addFile(key: string, fileName: string) {
    const time = Date.now()
    this.cacheFile[key] = {
      time,
      fileName
    }
    return this.cacheFile
  }
  updateFile(key: string, value: Partial<InterfaceChildFileCache> = {}) {
    if (this.cacheFile[key]) {
      const time = Date.now()
      this.cacheFile[key] = {
        ...this.cacheFile[key],
        time,
        ...value,
      }
    }
    return this.cacheFile
  }
  getFile(key: string) {
    return this.cacheFile[key]
  }
  hasFile(key: string) {
    return this.cacheFile.hasOwnProperty(key)
  }
}
