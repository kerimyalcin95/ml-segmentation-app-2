import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PythonServer } from "../python/PythonServer";
import { WindowManager } from "./windowManager";
import { IpcHandlers } from "./ipcHandlers";

export class ElectronApp {

    private readonly pythonServer: PythonServer;

    private window?: BrowserWindow;
    private readonly windowManager = new WindowManager();

    public constructor() {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        this.pythonServer = new PythonServer(
            app.isPackaged
                ? path.join(
                    process.resourcesPath,
                    "app.asar.unpacked",
                    "python",
                    "server.py"
                )
                : path.join(
                    __dirname,
                    "..",
                    "..",
                    "python",
                    "server.py"
                )
        );
    }

    public start(): void {

        app.whenReady().then(async () => {

            try {

                new IpcHandlers(this.pythonServer).register();

                this.configurePython();

                await this.pythonServer.start();

                this.window = this.windowManager.create();

            } catch (error) {

                console.error("Failed to start Python server:", error);

                app.quit();

            }

        });

        app.on("window-all-closed", () => {

            this.pythonServer.stop();

            if (process.platform !== "darwin") {
                app.quit();
            }

        });

    }

    private configurePython(): void {

        this.pythonServer.onMessage = (message: string) => {

            if (
                this.window &&
                !this.window.webContents.isLoading()
            ) {
                this.window.webContents.send(
                    "update-button",
                    message
                );
            }

        };

    }

}