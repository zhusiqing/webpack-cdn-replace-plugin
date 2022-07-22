"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const path_1 = require("path");
const io_1 = require("./io");
const CACHE_FILE = 'cache.json';
const CACHE_FILE_PATH = (0, path_1.join)(__dirname, `../${CACHE_FILE}`);
const CACHE_TIME = 1e3 * 60 * 60 * 24; // 一天
const CACHE_FILE_TIME = 1e3 * 60 * 30; // 半小时
class Cache {
    cache = {
        cacheCDN: {},
        cacheFile: {},
        lastCacheTime: Date.now()
    };
    cacheCDN = {};
    cacheFile = {};
    cachePath;
    constructor(cachePath = CACHE_FILE_PATH) {
        this.cachePath = cachePath;
        this.init();
    }
    init() {
        const time = Date.now();
        const _this = this;
        (0, io_1.ensure)(_this.cachePath);
        let cacheCDN = {};
        let cacheFile = {};
        let cacheParse = {
            cacheCDN,
            cacheFile,
            lastCacheTime: time
        };
        if (time - _this.cache.lastCacheTime <= CACHE_TIME) {
            const cacheJson = (0, io_1.read)(_this.cachePath) || '{}';
            cacheParse = JSON.parse(cacheJson);
            cacheCDN = cacheParse.cacheCDN || {};
            cacheFile = cacheParse.cacheFile || {};
        }
        Object.entries(cacheCDN).forEach(([k, v]) => {
            cacheCDN[k] = v;
        });
        Object.entries(cacheFile).forEach(([k, v]) => {
            // 缓存时间是为了解决vue-cli的二次构建问题
            if (time - v.time <= CACHE_FILE_TIME) {
                cacheFile[k] = v;
            }
        });
        this.cacheCDN = cacheCDN;
        this.cacheFile = cacheFile;
        this.cache = {
            cacheCDN,
            cacheFile,
            lastCacheTime: time
        };
    }
    persistence() {
        const cacheJson = JSON.stringify(this.cache);
        (0, io_1.write)(this.cachePath, cacheJson);
    }
    clear() {
    }
    addCDN(key, value) {
        this.cacheCDN[key] = value;
        return this.cacheCDN;
    }
    getCDN(key) {
        return this.cacheCDN[key];
    }
    hasCDN(key) {
        return this.cacheCDN.hasOwnProperty(key);
    }
    addFile(key, fileName) {
        const time = Date.now();
        this.cacheFile[key] = {
            time,
            fileName
        };
        return this.cacheFile;
    }
    updateFile(key, value = {}) {
        if (this.cacheFile[key]) {
            const time = Date.now();
            this.cacheFile[key] = {
                ...this.cacheFile[key],
                time,
                ...value,
            };
        }
        return this.cacheFile;
    }
    getFile(key) {
        return this.cacheFile[key];
    }
    hasFile(key) {
        return this.cacheFile.hasOwnProperty(key);
    }
}
exports.Cache = Cache;
