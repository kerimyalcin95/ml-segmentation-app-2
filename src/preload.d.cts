export interface ElectronAPI {
    subscribeServerMessages: (callback: (message: string) => void) => () => void;
    sendToServer: (message: string) => void;

    log: (...args: unknown[]) => void;
    onTerminalData: (
        callback: (chunk: Uint8Array) => void,
    ) => () => void;

    showOpenImageDialog: (
        defaultPath?: string,
    ) => Promise<string | null>;

    showSaveImageDialog: (
        defaultPath?: string,
    ) => Promise<SaveImageDialogResult | null>;

    writeImage: (
        filePath: string,
        imageBytes: Uint8Array,
    ) => Promise<string>;
    readImage: (
        filePath: string,
    ) => Promise<Uint8Array>;

    showOpenLabelDialog(
        defaultPath?: string,
    ): Promise<string | null>;
    showSaveLabelDialog(
        defaultPath?: string,
    ): Promise<{
        filePath: string;
    } | null>;

    writeLabels(
        filePath: string,
        json: string,
    ): Promise<void>;
    readLabels(
        filePath: string,
    ): Promise<string>;

    showOpenLabelImageDialog: (
        defaultPath?: string,
    ) => Promise<string | null>;

    showSaveLabelImageDialog: (
        defaultPath?: string,
    ) => Promise<SaveImageDialogResult | null>;

    writeLabelImage: (
        filePath: string,
        imageBytes: Uint8Array,
    ) => Promise<string>;

    readLabelImage: (
        filePath: string,
    ) => Promise<Uint8Array>;
}

export interface SaveImageDialogResult {
    filePath: string;
    extension: string;
}

export interface SaveLabelDialogResult {
    filePath: string;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}