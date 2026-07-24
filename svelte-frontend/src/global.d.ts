declare global {
    type ElectronAPI = {
        onMessage: (callback: (message: string) => void) => () => void;
        sendMessage: (message: string) => void;
        log: (...args: unknown[]) => void;
        openImage(): Promise<string | null>;
        saveImage: (
            imageData: string
        ) => Promise<string | null>;
    };

    interface Window {
        versions: {
            node: () => string;
            chrome: () => string;
            electron: () => string;
        };
        electronAPI?: ElectronAPI;
    }
}

export { };