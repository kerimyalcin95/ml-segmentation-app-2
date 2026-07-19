import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('versions', {
    node: (): string => process.versions.node,
    chrome: (): string => process.versions.chrome,
    electron: (): string => process.versions.electron,
});

contextBridge.exposeInMainWorld('electronAPI', {
    onMessage: (callback: (message: string) => void) => {
        ipcRenderer.on('update-button', (_event: IpcRendererEvent, message: string) => {
            callback(message);
        });
    },
    sendMessage: (message: string) => {
        ipcRenderer.send('send-to-python', message);
    },
    log: (...args: unknown[]) => {
        ipcRenderer.send("renderer-log", ...args);
    }
});