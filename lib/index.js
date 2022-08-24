"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadPlugin = void 0;
const path_1 = require("path");
const utils_1 = require("./utils");
const ora_1 = __importDefault(require("ora"));
class UploadPlugin {
    cache;
    options;
    constructor(options = {}) {
        const types = {
            img: ['.png', '.jpg', '.jpeg', '.svg'],
            font: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
            css: ['.css'],
            js: ['.js'],
            html: ['.html']
        };
        this.options = {
            cache: true,
            uploadFn: (path, fileName) => fileName,
            ...options,
            types: { ...types, ...options.types },
        };
        this.cache = this.options.cache ? new utils_1.Cache() : {
            cacheCDN: {},
            cacheFile: {}
        };
    }
    apply(compiler) {
        compiler.hooks['done'].tapAsync('UploadPlugin', async (compilation, callback) => {
            callback();
            const { assetsInfo } = compilation.compilation;
            const { types, cache: isCache } = this.options;
            const imgArr = [];
            const fontArr = [];
            const cssArr = [];
            const jsArr = [];
            const htmlArr = [];
            const imgFilenameObj = {};
            const fontFilenameObj = {};
            const cssFilenameObj = {};
            const jsFilenameObj = {};
            const { output } = compiler.options;
            const { path, publicPath } = output;
            if (publicPath !== '/') {
                (0, utils_1.log)('error', `publicPath must be /, now is ${publicPath}`);
                return;
            }
            const { img: imgTypes, font: fontTypes, css: cssTypes, js: jsTypes, html: htmlTypes } = types;
            // 获取上传文件
            for (const k of assetsInfo) {
                const [filename] = k;
                const ext = (0, path_1.extname)(filename);
                const filePath = (0, path_1.join)(path, filename);
                if (imgTypes.includes(ext)) {
                    imgArr.push(filePath);
                    imgFilenameObj[filename] = filePath;
                }
                else if (fontTypes.includes(ext)) {
                    fontArr.push(filePath);
                    fontFilenameObj[filename] = filePath;
                }
                else if (cssTypes.includes(ext)) {
                    cssArr.push(filePath);
                    cssFilenameObj[filename] = filePath;
                }
                else if (jsTypes.includes(ext)) {
                    jsArr.push(filePath);
                    jsFilenameObj[filename] = filePath;
                    // 这里采用缓存是因为vue-cli在兼容浏览器时，会进行二次打包
                    if (isCache) {
                        this.cache.addFile(filePath, filename);
                    }
                    else {
                        this.cache.cacheFile[filePath] = filename;
                    }
                }
                else if (htmlTypes.includes(ext)) {
                    htmlArr.push(filePath);
                }
            }
            const spinner = (0, ora_1.default)('uploading img and font').start();
            await this.uploadAndCacheHandle({ ...imgFilenameObj, ...fontFilenameObj });
            spinner.text = 'upload img and font is completed';
            spinner.succeed();
            const spinnerCss = (0, ora_1.default)('update css').start();
            // 在css文件中上传图片和字体替换
            const replaceContentHandle = (0, utils_1.cdnReplaceContentHandle)(publicPath);
            try {
                replaceContentHandle(cssArr, { ...imgFilenameObj, ...fontFilenameObj }, { ...this.cache.cacheCDN });
            }
            catch (error) {
                console.error(error);
            }
            spinnerCss.text = 'uploading css';
            await this.uploadAndCacheHandle({ ...cssFilenameObj });
            spinnerCss.text = 'upload css is completed';
            spinnerCss.succeed();
            const spinnerJs = (0, ora_1.default)('update js').start();
            // 在js文件中上传图片和字体替换
            replaceContentHandle(jsArr, { ...imgFilenameObj, ...fontFilenameObj, ...cssFilenameObj }, { ...this.cache.cacheCDN });
            spinnerJs.text = 'uploading js';
            await this.uploadAndCacheHandle({ ...jsFilenameObj });
            spinnerJs.text = 'upload js is completed';
            spinnerJs.succeed();
            const spinnerHtml = (0, ora_1.default)('update HTML').start();
            // 更新html中地址
            const cacheFile = {};
            Object.entries(this.cache.cacheFile).forEach(([key, value]) => {
                if (isCache) {
                    cacheFile[value.fileName] = key;
                }
                else {
                    cacheFile[value] = key;
                }
            });
            replaceContentHandle(htmlArr, { ...cssFilenameObj, ...cacheFile }, { ...this.cache.cacheCDN });
            spinnerHtml.text = 'update HTML is completed';
            spinnerHtml.succeed();
            // 缓存持久化
            isCache && this.cache.persistence();
            // callback()
        });
        compiler.hooks.compilation.tap('test', (compilation) => {
            compilation.mainTemplate.hooks.requireExtensions.tap('test', (source, chunk, hash) => {
                const chunkMap = chunk.getChunkMaps(true);
                if (Object.keys(chunkMap.hash).length) {
                    const buff = [source];
                    buff.push('\n\n// rewrite __webpack_public_path__');
                    buff.push(`__webpack_require__.p = "";`);
                    return buff.join('\n') || '';
                }
                else {
                    return source;
                }
            });
        });
    }
    async uploadAndCacheHandle(obj) {
        const { cache, options } = this;
        const arr = Object.entries(obj).map(([filename, filePath]) => ({
            filename,
            filePath
        }));
        for (const v of arr) {
            if (options.cache && cache.hasCDN(v.filePath)) {
                continue;
            }
            try {
                const cdnUrl = await options.uploadFn(v.filePath, v.filename);
                if (options.cache && cdnUrl) {
                    cache.addCDN(v.filePath, cdnUrl);
                }
                else {
                    cache.cacheCDN[v.filePath] = cdnUrl;
                }
            }
            catch (error) {
                (0, utils_1.log)('error', `upload error, filename: ${v.filename},path: ${v.filePath}`);
                console.error(error);
            }
        }
    }
}
exports.UploadPlugin = UploadPlugin;
