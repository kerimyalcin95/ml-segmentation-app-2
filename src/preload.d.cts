export interface ElectronAPI {
    onMessage: (callback: (message: string) => void) => () => void;
    sendMessage: (message: string) => void;
    log: (...args: unknown[]) => void;
    openImage: () => Promise<string | null>;
    showSaveImageDialog: () => Promise<SaveImageDialogResult | null>;
    writeImage: (
        filePath: string,
        imageBytes: Uint8Array,
    ) => Promise<string>;
}

export interface SaveImageDialogResult {
    filePath: string;
    extension: string;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}