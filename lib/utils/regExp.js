"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regExpJsStaticPath = exports.regExpCssStaticPath = void 0;
exports.regExpCssStaticPath = /([a-zA-Z]:\\|..\/|.\/)([^\\:*<>|"?\r\n/]+\/)*[^\\:*<>|"?\r\n/]+\.(png|jpg|jpeg|svg|ttf|otf|woff|woff2|eot)/g;
const regExpJsStaticPath = (filename) => new RegExp(`=[a-z].[a-z]\\+('|")${filename}${'\\1'}`, 'g');
exports.regExpJsStaticPath = regExpJsStaticPath;
