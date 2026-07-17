import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import path from 'node:path';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import WebSocket from 'ws';

let webSocket: WebSocket | undefined;
let pythonProcess: ChildProcessWithoutNullStreams | undefined;

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
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        },
    });

    window.loadFile(path.join(__dirname, '..', '..', 'html', '../', 'svelte-frontend', 'dist', 'index.html'));
};

const connectToPythonServer = (): void => {
    webSocket = new WebSocket('ws://localhost:8765');

    webSocket.on('open', () => {
        console.log('Connected to Python server');
        webSocket?.send('Hello from Electron main process!');
    });

    webSocket.on('message', (data) => {
        console.log(`Received from Python: ${data}`);
        const win = BrowserWindow.getAllWindows()[0];
        if (win && !win.webContents.isLoading()) {
            win.webContents.send('update-button', data.toString());
            console.log(`Sending [${data.toString()}] to IPC Electron`);
        }
    });

    webSocket.on('close', () => console.log('Connection closed'));
    webSocket.on('error', (err) => console.error('WebSocket error:', err));
};

const startPythonServer = (): void => {
    pythonProcess = spawn('python', ['-u', pythonPath]);
    console.log("Python server started.");

    pythonProcess.stdout.on('data', (data) => console.log(`Py: ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`PyErr: ${data}`));
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
