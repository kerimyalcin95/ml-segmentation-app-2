import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('versions', {
    node: (): string => process.versions.node,
    chrome: (): string => process.versions.chrome,
    electron: (): string => process.versions.electron,
});

contextBridge.exposeInMainWorld('electronAPI', {
    subscribeServerMessages: (callback: (message: string) => void) => {

        // After receiving message from server send as event
        const listener = (_event: IpcRendererEvent, message: string) => {
            callback(message);
        };

        ipcRenderer.on('message-from-server', listener);

        return () => {
            ipcRenderer.removeListener('message-from-server', listener);
        };
    },
    sendToServer: (message: string) => {
        console.log("Electron: Sending message to server");
        ipcRenderer.send('send-to-server', message);
    },

    // enables the front-end to log over electron which in term forwarded to xterm
    log: (...args: unknown[]) => {
        ipcRenderer.send("renderer-log", ...args);
    },
    // callback for xterm
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

    showOpenImageDialog: (defaultPath?: string) =>
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