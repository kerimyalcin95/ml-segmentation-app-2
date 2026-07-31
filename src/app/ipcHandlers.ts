import {
    dialog,
    ipcMain,
    IpcMainEvent
} from "electron";

import fs from "node:fs";

import { PythonServer } from "../python/pythonServer.js";

export class IpcHandlers {

    public constructor(
        private readonly pythonServer: PythonServer
    ) { }

    public register(): void {

        ipcMain.on(
            "send-to-python",
            (_event: IpcMainEvent, message: string) => {

                this.pythonServer.send(message);

            }
        );

        ipcMain.on(
            "renderer-log",
            (_event: IpcMainEvent, ...args: unknown[]) => {

                console.log("Electron:", ...args);

            }
        );

        ipcMain.handle(
            "open-image",
            async () => {

                const result = await dialog.showOpenDialog({

                    properties: ["openFile"],

                    filters: [

                        {
                            name: "Images",
                            extensions: [
                                "png",
                                "jpg",
                                "jpeg",
                                "webp",
                                "bmp",
                                "tiff"
                            ]
                        }

                    ]

                });

                if (result.canceled) {
                    return null;
                }

                return result.filePaths[0];

            }
        );

        ipcMain.handle(
            "save-image",
            async (_event, imageData: string) => {

                const result = await dialog.showSaveDialog({

                    title: "Save Image",

                    defaultPath: "image.png",

                    filters: [
                        {
                            name: "Supported Images",
                            extensions: [
                                "png",
                                "jpg",
                                "jpeg",
                                "webp",
                                "bmp",
                                "tiff"
                            ]
                        },
                        {
                            name: "PNG Image",
                            extensions: ["png"]
                        },
                        {
                            name: "JPEG Image",
                            extensions: ["jpg", "jpeg"]
                        },
                        {
                            name: "WebP Image",
                            extensions: ["webp"]
                        },
                        {
                            name: "Bitmap Image",
                            extensions: ["bmp"]
                        },
                        {
                            name: "TIFF Image",
                            extensions: ["tiff"]
                        }
                    ]

                });

                if (
                    result.canceled ||
                    !result.filePath
                ) {
                    return null;
                }

                const base64Data = imageData.replace(
                    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
                    ""
                );

                fs.writeFileSync(
                    result.filePath,
                    Buffer.from(base64Data, "base64")
                );

                return result.filePath;

            }
        );

    }

}