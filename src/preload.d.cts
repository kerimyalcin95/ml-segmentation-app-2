export interface ElectronAPI {
    onMessage: (callback: (message: string) => void) => () => void;
    sendMessage: (message: string) => void;
    log: (...args: unknown[]) => void;
    openImage: (
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
    onTerminalData: (
        callback: (chunk: Uint8Array) => void,
    ) => () => void;

    showOpenLabelDialog(): Promise<string | null>;

    showSaveLabelDialog(): Promise<{
        filePath: string;
    } | null>;

    writeLabels(
        filePath: string,
        json: string,
    ): Promise<void>;

    readLabels(
        filePath: string,
    ): Promise<string>;
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