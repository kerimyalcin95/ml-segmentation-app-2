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

    showOpenImageDialog: (
        defaultPath?: string
    ) =>
        ipcRenderer.invoke(
            "show-open-image-dialog",
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

    showOpenLabelDialog: (
        defaultPath?: string
    ) =>
        ipcRenderer.invoke(
            "show-open-label-dialog",
            defaultPath,
        ),

    showSaveLabelDialog: (
        defaultPath?: string
    ) =>
        ipcRenderer.invoke(
            "show-save-label-dialog",
            defaultPath,
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

    showOpenLabelImageDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            'show-open-label-image-dialog',
            defaultPath,
        ),

    showSaveLabelImageDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            'show-save-label-image-dialog',
            defaultPath,
        ),

    writeLabelImage: (
        width: number,
        height: number,
        mask: Uint8Array,
        palette: string[],
    ) =>
        ipcRenderer.invoke(
            'write-label-image',
            width,
            height,
            mask,
            palette,
        ),

    readLabelImage: (
        filePath: string,
    ) =>
        ipcRenderer.invoke(
            'read-label-image',
            filePath,
        ),

    showOpenDirectoryDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            "show-open-directory-dialog",
            defaultPath,
        ),

    showOpenModelDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            "show-open-model-dialog",
            defaultPath,
        ),

    showSaveModelDialog: (
        defaultPath?: string,
    ) =>
        ipcRenderer.invoke(
            "show-save-model-dialog",
            defaultPath,
        ),
});