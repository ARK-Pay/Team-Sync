/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Circus } from '@jest/types';
export declare const ROOT_DESCRIBE_BLOCK_NAME = "ROOT_DESCRIBE_BLOCK";
export declare const resetState: () => void;
export declare const getState: () => Circus.State;
export declare const setState: (state: Circus.State) => Circus.State;
export declare const dispatch: (event: Circus.AsyncEvent) => Promise<void>;
export declare const dispatchSync: (event: Circus.SyncEvent) => void;
export declare const addEventHandler: (handler: Circus.EventHandler) => void;
 SnapshotReturnOptions = {
    actual: string;
    count: number;
    expected?: string;
    key: string;
    pass: boolean;
};
declare type SaveStatus = {
    deleted: boolean;
    saved: boolean;
};
export default class SnapshotState {
    private _counters;
    private _dirty;
    private _index;
    private _updateSnapshot;
    private _snapshotData;
    private _initialData;
    private _snapshotPath;
    private _inlineSnapshots;
    private _uncheckedKeys;
    private _prettierPath;
    private _snapshotFormat;
    added: number;
    expand: boolean;
    matched: number;
    unmatched: number;
    updated: number;
    constructor(snapshotPath: Config.Path, options: SnapshotStateOptions);
    markSnapshotsAsCheckedForTest(testName: string): void;
    private _addSnapshot;
    clear(): void;
    save(): SaveStatus;
    getUncheckedCount(): number;
    getUncheckedKeys(): Array<string>;
    removeUncheckedKeys(): void;
    match({ testName, received, key, inlineSnapshot, isInline, error, }: SnapshotMatchOptions): SnapshotReturnOptions;
    fail(testName: string, _received: unknown, key?: string): string;
}
export {};
