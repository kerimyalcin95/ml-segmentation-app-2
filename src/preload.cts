import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('versions', {
    node: (): string => process.versions.node,
    chrome: (): string => process.versions.chrome,
    electron: (): string => process.versions.electron,
});

contextBridge.exposeInMainWorld('electronAPI', {
    onMessage: (callback: (message: string) => void) => {
        const listener = (_event: IpcRendererEvent, message: string) => {
            callback(message);
        };

        ipcRenderer.on('update-button', listener);

        return () => {
            ipcRenderer.removeListener('update-button', listener);
        };
    },
    sendMessage: (message: string) => {
        ipcRenderer.send('send-to-python', message);
    },
    log: (...args: unknown[]) => {
        ipcRenderer.send("renderer-log", ...args);
    },
    openImage: () => ipcRenderer.invoke("open-image"),
    saveImage: (imageData: string) =>
    ipcRenderer.invoke("save-image", imageData),
});