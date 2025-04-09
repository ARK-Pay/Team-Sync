import * as fsStat from '@nodelib/fs.stat';
import * as fs from './adapters/fs';
export interface Options {
    followSymbolicLinks?: boolean;
    fs?: Partial<fs.FileSystemAdapter>;
    pathSegmentSeparator?: string;
    stats?: boolean;
    throwErrorOnBrokenSymbolicLink?: boolean;
}
export default class Settings {
    private readonly _options;
    readonly followSymbolicLinks: boolean;
    readonly fs: fs.FileSystemAdapter;
    readonly pathSegmentSeparator: string;
    readonly stats: boolean;
    readonly throwErrorOnBrokenSymbolicLink: boolean;
    readonly fsStatSettings: fsStat.Settings;
    constructor(_options?: Options);
    private _getValue;
}
ats?: boolean;
    throwErrorOnBrokenSymbolicLink?: boolean;
}
export default class Settings {
    private readonly _options;
    readonly basePath?: string;
    readonly concurrency: number;
    readonly deepFilter: DeepFilterFunction | null;
    readonly entryFilter: EntryFilterFunction | null;
    readonly errorFilter: ErrorFilterFunction | null;
    readonly pathSegmentSeparator: string;
    readonly fsScandirSettings: fsScandir.Settings;
    constructor(_options?: Options);
    private _getValue;
}
