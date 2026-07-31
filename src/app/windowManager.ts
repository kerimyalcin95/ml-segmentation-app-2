import { BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class WindowManager {

    private readonly dirname: string;

    private mainWindow: BrowserWindow | null = null;

    public constructor() {

        const filename = fileURLToPath(import.meta.url);
        this.dirname = path.dirname(filename);

    }

    public create(): BrowserWindow {

        if (this.mainWindow !== null) {
            return this.mainWindow;
        }

        this.mainWindow = new BrowserWindow({

            autoHideMenuBar: false,

            title: "ML-Segmentation",

            minWidth: 500,
            minHeight: 500,

            webPreferences: {

                preload: path.join(
                    this.dirname,
                    "..",
                    "preload.cjs"
                ),

                contextIsolation: true,
                nodeIntegration: false
            }

        });

        this.mainWindow.removeMenu();

        this.mainWindow.webContents.on(
            "before-input-event",
            (_event, input) => {

                if (input.key === "F12") {
                    this.mainWindow?.webContents.toggleDevTools();
                }
            }
        );

        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });

        this.mainWindow.maximize();

        void this.mainWindow.loadFile(
            path.join(
                this.dirname,
                "..",
                "..",
                "..",
                "svelte-frontend",
                "dist",
                "index.html"
            )
        );

        return this.mainWindow;

    }

    public getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

}