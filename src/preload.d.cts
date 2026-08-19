export interface ElectronAPI {
    dirname: (
        filePath: string,
    ) => Promise<string>;
    loadSession: () => Promise<unknown>;
    saveSession: (
        session: unknown,
    ) => Promise<void>;

    subscribeServerMessages: (callback: (message: string) => void) => () => void;
    restartPythonServer: (
        port: number,
    ) => Promise<void>;
    getPythonServerError: () => Promise<string | undefined>;
    sendToServer: (message: string) => void;
    subscribePythonServerErrors: (
        callback: (message: string) => void,
    ) => () => void;

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
        width: number,
        height: number,
        mask: Uint8Array,
        palette: string[],
    ) => Promise<Uint8Array>;

    readLabelImage: (
        filePath: string,
    ) => Promise<LabelImageData>;

    showOpenDirectoryDialog: (
        defaultPath?: string,
    ) => Promise<string | null>;

    showOpenModelDialog: (
        defaultPath?: string,
    ) => Promise<string | null>;

    showSaveModelDialog: (
        defaultPath?: string,
    ) => Promise<string | null>;
}

export interface SaveImageDialogResult {
    filePath: string;
    extension: string;
}

export interface SaveLabelDialogResult {
    filePath: string;
}

export interface LabelImageData {
    width: number;
    height: number;
    mask: Uint8Array;
    palette: string[];
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}