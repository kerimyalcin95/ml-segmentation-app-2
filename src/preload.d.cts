export interface ElectronAPI {
    onMessage: (callback: (message: string) => void) => void;
    sendMessage: (message: string) => void;
    log: (...args: unknown[]) => void;
    openImage: () => Promise<string | null>;
    saveImage: (
        imageData: string
    ) => Promise<string | null>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}