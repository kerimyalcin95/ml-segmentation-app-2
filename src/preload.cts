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
    openImage: (defaultPath?: string) =>
        ipcRenderer.invoke(
            "open-image",
            defaultPath,
        ),
    showSaveImageDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            "show-save-image-dialog",
            defaultPath,
        ),

    writeImage: (
        filePath: string,
        imageBytes: Uint8Array,
    ) =>
        ipcRenderer.invoke(
            "write-image",
            filePath,
            imageBytes,
        ),

    readImage: (
        filePath: string,
    ) =>
        ipcRenderer.invoke(
            "read-image",
            filePath,
        ),

    onTerminalData: (
        callback: (chunk: Uint8Array) => void,
    ) => {
        const listener = (
            _event: IpcRendererEvent,
            chunk: Uint8Array,
        ) => {
            callback(chunk);
        };

        ipcRenderer.on("terminal-data", listener);

        return () => {
            ipcRenderer.removeListener(
                "terminal-data",
                listener,
            );
        };
    },

    showOpenLabelDialog: () =>
        ipcRenderer.invoke(
            "show-open-label-dialog",
        ),

    showSaveLabelDialog: () =>
        ipcRenderer.invoke(
            "show-save-label-dialog",
        ),

    writeLabels: (
        filePath: string,
        json: string,
    ) =>
        ipcRenderer.invoke(
            "write-labels",
            filePath,
            json,
        ),

    readLabels: (
        filePath: string,
    ) =>
        ipcRenderer.invoke(
            "read-labels",
            filePath,
        ),
});