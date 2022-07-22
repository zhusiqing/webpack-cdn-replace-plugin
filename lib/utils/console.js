"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const consola_1 = __importDefault(require("consola"));
function log(type, message, ...args) {
    switch (type) {
        case 'success':
            consola_1.default.success(message, ...args);
            break;
        case 'error':
            consola_1.default.error(message, ...args);
            break;
        case 'log':
            consola_1.default.log(message, ...args);
            break;
        case 'warn':
            consola_1.default.warn(message, ...args);
            break;
        case 'info':
            consola_1.default.info(message, ...args);
            break;
        case 'debug':
            consola_1.default.debug(message, ...args);
            break;
        case 'trace':
            consola_1.default.trace(message, ...args);
            break;
        default:
            consola_1.default.log(message, ...args);
            break;
    }
}
exports.log = log;
