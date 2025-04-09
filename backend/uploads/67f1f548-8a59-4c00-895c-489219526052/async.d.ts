/// <reference types="node" />
import type Settings from '../settings';
import type { Entry } from '../types';
export declare type AsyncCallback = (error: NodeJS.ErrnoException, entries: Entry[]) => void;
export declare function read(directory: string, settings: Settings, callback: AsyncCallback): void;
export declare function readdirWithFileTypes(directory: string, settings: Settings, callback: AsyncCallback): void;
export declare function readdir(directory: string, settings: Settings, callback: AsyncCallback): void;
 typeof fsScandir.scandir;
    protected readonly _emitter: EventEmitter;
    private readonly _queue;
    private _isFatalError;
    private _isDestroyed;
    constructor(_root: string, _settings: Settings);
    read(): EventEmitter;
    get isDestroyed(): boolean;
    destroy(): void;
    onEntry(callback: EntryEventCallback): void;
    onError(callback: ErrorEventCallback): void;
    onEnd(callback: EndEventCallback): void;
    private _pushToQueue;
    private _worker;
    private _handleError;
    private _handleEntry;
    private _emitEntry;
}
export {};
