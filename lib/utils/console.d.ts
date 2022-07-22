import { ConsolaLogObject } from 'consola';
declare type EnumType = 'success' | 'error' | 'log' | 'warn' | 'info' | 'debug' | 'trace';
export declare function log(type: EnumType, message: ConsolaLogObject | any, ...args: any[]): void;
export {};
