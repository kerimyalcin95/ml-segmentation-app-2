import { app, BrowserWindow, ipcMain, IpcMainEvent, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import WebSocket from 'ws';

let webSocket: WebSocket | undefined;
let pythonProcess: ChildProcessWithoutNullStreams | undefined;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// distinguish between development and production environment
const pythonPath: string = app.isPackaged
    ? path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'python',
        'server.py'
    )
    : path.join(__dirname, '..', '..', 'python', 'server.py');

const createWindow = (): void => {

    const window = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        },
        title: "ML-Segmentation",
        minHeight: 500,
        minWidth: 500
    });

    window.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F12") {
            window.webContents.toggleDevTools();
        }
    });

    window.maximize();
    window.loadFile(path.join(__dirname, '..', '..', 'html', '../', 'svelte-frontend', 'dist', 'index.html'));
};

const connectToPythonServer = (): void => {
    webSocket = new WebSocket('ws://localhost:8765');
    console.log('Electron: Listening on ws://localhost:8765');

    webSocket.on('open', () => {
        console.log('Electron: Connected');
    });

    webSocket.on('message', (data) => {
        const window = BrowserWindow.getAllWindows()[0];
        if (window && !window.webContents.isLoading()) {
            window.webContents.send('update-button', data.toString());
        }
    });

    webSocket.on('close', (code, reason) => {
        const reasonStr = reason ? `, ${reason.toString()}` : '';
        console.log(`WebSocket closed: ${code}${reasonStr}`);
    });

    webSocket.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
};

const startPythonServer = (): void => {
    pythonProcess = spawn('python', ['-u', pythonPath]);
    console.log("Python: Server started.");

    pythonProcess.stdout.on('data', (data) => console.log(`Python: ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));
};

const stopPythonServer = (): void => {
    webSocket?.close();
    pythonProcess?.kill();
};

ipcMain.on('send-to-python', (event: IpcMainEvent, message: string) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(message);
    } else {
        console.error('WebSocket not connected');
    }
});

ipcMain.on('renderer-log', (_event: IpcMainEvent, ...args: unknown[]) => {
    console.log('Electron: ', ...args);
});

ipcMain.handle("open-image", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            {
                name: "Images",
                extensions: ["png", "jpg", "jpeg", "webp", "bmp", "tiff"]
            }
        ]
    });

    if (result.canceled) {
        return null;
    }

    return result.filePaths[0];
});

app.whenReady().then(() => {
    createWindow();
    startPythonServer();

    setTimeout(connectToPythonServer, 1000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    stopPythonServer();
    if (process.platform !== 'darwin') app.quit();
});
