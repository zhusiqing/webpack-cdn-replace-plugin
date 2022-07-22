import type { Compiler } from 'webpack';
import { Cache } from './utils';
import type { InterfaceCDNCache } from './utils';
export declare type TypeArr = string[];
export interface InterfaceTypes {
    img: TypeArr;
    font: TypeArr;
    css: TypeArr;
    js: TypeArr;
    html: TypeArr;
}
export declare type InterfaceUploadFn = (path: string, fileName: string) => string | Promise<string>;
export interface InterfaceOptions {
    cache: boolean;
    types: InterfaceTypes;
    uploadFn: InterfaceUploadFn;
}
interface InterfaceNoCache {
    cacheCDN: InterfaceCDNCache<string>;
    cacheFile: InterfaceCDNCache<string>;
}
export declare class UploadPlugin {
    cache: Cache | InterfaceNoCache;
    options: InterfaceOptions;
    constructor(options?: Partial<InterfaceOptions>);
    apply(compiler: Compiler): void;
    uploadAndCacheHandle(obj: {
        [key: string]: string;
    }): Promise<void>;
}
export {};
