import { BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class WindowManager {

    public static create(): BrowserWindow {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const window = new BrowserWindow({

            autoHideMenuBar: true,

            title: "ML-Segmentation",

            minWidth: 500,
            minHeight: 500,

            webPreferences: {

                preload: path.join(
                    __dirname,
                    "..",
                    "preload.cjs"
                ),

                contextIsolation: true,
                nodeIntegration: false

            }

        });

        window.webContents.on(
            "before-input-event",
            (_event, input) => {

                if (input.key === "F12") {
                    window.webContents.toggleDevTools();
                }

            }
        );

        window.maximize();

        window.loadFile(
            path.join(
                __dirname,
                "..",
                "..",
                "html",
                "../",
                "svelte-frontend",
                "dist",
                "index.html"
            )
        );

        return window;

    }

}