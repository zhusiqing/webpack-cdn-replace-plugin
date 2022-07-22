"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cdnReplaceContentHandle = exports.publicPathHandle = void 0;
const path_1 = require("path");
const io_1 = require("./io");
const console_1 = require("./console");
const regExp_1 = require("./regExp");
const publicPathHandle = (publicPath) => (content) => {
    const DEFAULT_SEP = '/';
    // match strictly
    const escapedSeparator = `\\${DEFAULT_SEP}`;
    let regStr = publicPath
        .split(DEFAULT_SEP)
        .filter((item) => !!item)
        .map((part) => {
        if (/\./.test(part)) {
            return part.replace(/\.+/g, (match) => match
                .split('')
                .map((dot) => '\\' + dot)
                .join(''));
        }
        return part;
    })
        .join(escapedSeparator);
    // absolute publicPath
    if (publicPath.startsWith(DEFAULT_SEP)) {
        let prefix = '';
        const publicPathArray = publicPath.split('');
        while (publicPathArray.length) {
            const char = publicPathArray.shift();
            if (char === DEFAULT_SEP) {
                prefix += escapedSeparator;
            }
            else {
                break;
            }
        }
        regStr = `${prefix}${regStr}`;
    }
    // avoid matching url in form of `//path/to/resource`
    // aka url which drop the protocol part
    if (publicPath.endsWith(DEFAULT_SEP)) {
        regStr += '([^/])';
    }
    const refinedRegStr = `([(=]['"]?)${regStr}`;
    const reg = new RegExp(refinedRegStr, 'g');
    return content.replace(reg, (_, prefix, suffix) => {
        let result = '';
        if (prefix) {
            result = `${prefix}${result}`;
        }
        // suffix possibly is offset , assertion type
        if (suffix && typeof suffix !== 'number') {
            result += suffix;
        }
        return result;
    });
};
exports.publicPathHandle = publicPathHandle;
const cdnReplaceContentHandle = (publicPath) => (arr, fileNameObj, cdnArr) => {
    const removePublicPath = (0, exports.publicPathHandle)(publicPath);
    const prefix = publicPath || '';
    for (const v of arr) {
        const content = removePublicPath((0, io_1.read)(v));
        const fileType = (0, path_1.extname)(v);
        let newContent = content;
        let matchArr = [];
        if (fileType === '.css') {
            matchArr = newContent.match(regExp_1.regExpCssStaticPath) || [];
        }
        Object.entries(fileNameObj).forEach(([filename, filePath]) => {
            const cdnPath = cdnArr[filePath];
            if (cdnPath) {
                try {
                    if (/^http:\/\/|https:\/\//.test(cdnPath)) {
                        // 当publicPath为空时，css文件会采用相对路径，这里用于替换
                        if (matchArr.length) {
                            const find = matchArr.find(el => el.indexOf(filename) !== -1);
                            if (find) {
                                newContent = newContent.replace(find, cdnPath);
                            }
                        }
                        else {
                            const replaceStr = (0, path_1.join)(prefix, filename);
                            const reg = new RegExp(replaceStr, 'g');
                            newContent = newContent.replace(reg, cdnPath);
                        }
                    }
                    else {
                        const reg = new RegExp(filename, 'g');
                        newContent = newContent.replace(reg, cdnPath);
                    }
                }
                catch (error) {
                    (0, console_1.log)('error', 'cdnReplaceContentHandle error');
                    console.error(error);
                }
            }
        });
        (0, io_1.write)(v, newContent);
    }
};
exports.cdnReplaceContentHandle = cdnReplaceContentHandle;
