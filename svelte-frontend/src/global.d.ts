declare global {
    interface SaveImageDialogResult {
        filePath: string;
        extension: string;
    }

    interface ElectronAPI {
        onMessage(callback: (message: string) => void): () => void;
        sendMessage(message: string): void;
        log(...args: unknown[]): void;

        openImage(
            defaultPath?: string,
        ): Promise<string | null>;

        showSaveImageDialog(
            defaultPath?: string,
        ): Promise<SaveImageDialogResult | null>;

        writeImage(
            filePath: string,
            imageBytes: Uint8Array,
        ): Promise<string>;
    }

    interface Window {
        versions: {
            node(): string;
            chrome(): string;
            electron(): string;
        };

        electronAPI?: ElectronAPI;
    }
}

export { };