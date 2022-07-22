import { ArrayBufferView } from 'fs-extra';
export declare const read: (path: string) => string;
export declare const write: (path: string, content: string | ArrayBufferView) => void;
export declare const ensure: (path: string) => void;
