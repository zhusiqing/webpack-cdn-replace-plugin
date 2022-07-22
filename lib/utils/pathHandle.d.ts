import { InterfaceCDNCache } from './cache';
export declare const publicPathHandle: (publicPath: string) => (content: string) => string;
export declare const cdnReplaceContentHandle: (publicPath: string) => (arr: string[], fileNameObj: InterfaceCDNCache<string>, cdnArr: InterfaceCDNCache<string>) => void;
