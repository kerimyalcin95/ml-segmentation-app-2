declare global {
    interface SaveImageDialogResult {
        filePath: string;
        extension: string;
    }

    interface SaveLabelDialogResult {
        filePath: string;
    }

    interface ElectronAPI {
        subscribeServerMessages(callback: (message: string) => void): () => void;
        sendToServer(message: string): void;

        log(...args: unknown[]): void;
        onTerminalData(
            callback: (chunk: Uint8Array) => void,
        ): () => void;

        showOpenImageDialog(
            defaultPath?: string,
        ): Promise<string | null>;
        showSaveImageDialog(
            defaultPath?: string,
        ): Promise<SaveImageDialogResult | null>;
        writeImage(
            filePath: string,
            imageBytes: Uint8Array,
        ): Promise<string>;
        readImage(
            filePath: string,
        ): Promise<Uint8Array>;

        showOpenLabelDialog(
            defaultPath?: string,
        ): Promise<string | null>;
        showSaveLabelDialog(
            defaultPath?: string,
        ): Promise<SaveLabelDialogResult | null>;
        writeLabels(
            filePath: string,
            json: string,
        ): Promise<void>;
        readLabels(
            filePath: string,
        ): Promise<string>;

        showOpenLabelImageDialog(
            defaultPath?: string,
        ): Promise<string | null>;

        showSaveLabelImageDialog(
            defaultPath?: string,
        ): Promise<SaveImageDialogResult | null>;

        writeLabelImage(
            filePath: string,
            imageBytes: Uint8Array,
        ): Promise<string>;

        readLabelImage(
            filePath: string,
        ): Promise<Uint8Array>;
    }

    interface Window {
        versions: {
            node(): string;
            chrome(): string;
            electron(): string;
        };

        electronAPI: ElectronAPI;
    }
}

export { };