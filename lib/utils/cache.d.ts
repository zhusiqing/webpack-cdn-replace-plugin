interface InterfaceChildFileCache {
    time: number;
    fileName: string;
}
export interface InterfaceCDNCache<T = string> {
    [key: string]: T;
}
export interface InterfaceFileCache {
    [key: string]: InterfaceChildFileCache;
}
export interface InterfaceCache {
    cacheCDN: InterfaceCDNCache;
    cacheFile: InterfaceFileCache;
    lastCacheTime: number;
}
export declare class Cache {
    cache: InterfaceCache;
    cacheCDN: InterfaceCDNCache;
    cacheFile: InterfaceFileCache;
    cachePath: string;
    constructor(cachePath?: string);
    init(): void;
    persistence(): void;
    clear(): void;
    addCDN(key: string, value: string): InterfaceCDNCache<string>;
    getCDN(key: string): string;
    hasCDN(key: string): boolean;
    addFile(key: string, fileName: string): InterfaceFileCache;
    updateFile(key: string, value?: Partial<InterfaceChildFileCache>): InterfaceFileCache;
    getFile(key: string): InterfaceChildFileCache;
    hasFile(key: string): boolean;
}
export {};
