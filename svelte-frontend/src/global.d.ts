declare global {
    interface SaveImageDialogResult {
        filePath: string;
        extension: string;
    }

    interface ElectronAPI {
        onMessage(callback: (message: string) => void): () => void;
        sendMessage(message: string): void;
        log(...args: unknown[]): void;

        openImage(): Promise<string | null>;

        showSaveImageDialog(): Promise<SaveImageDialogResult | null>;

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

export {};