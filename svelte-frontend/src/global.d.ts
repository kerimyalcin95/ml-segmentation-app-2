declare global {
    type ElectronAPI = {
        onMessage: (callback: (message: string) => void) => void;
        sendMessage: (message: string) => void;
        log: (message: string) => void;
    };

    interface Window {
        versions: {
            node: () => string;
            chrome: () => string;
            electron: () => string;
        };
        electronAPI: ElectronAPI;
    }
}

export {};