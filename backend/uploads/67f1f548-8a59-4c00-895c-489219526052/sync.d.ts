import type Settings from '../settings';
import type { Entry } from '../types';
export declare function read(directory: string, settings: Settings): Entry[];
export declare function readdirWithFileTypes(directory: string, settings: Settings): Entry[];
export declare function readdir(directory: string, settings: Settings): Entry[];
];
}

    private _handleQueue;
    private _handleDirectory;
    private _handleError;
    private _handleEntry;
    private _pushToStorage;
}
