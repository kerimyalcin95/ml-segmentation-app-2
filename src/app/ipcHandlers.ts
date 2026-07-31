import {
    dialog,
    ipcMain,
    IpcMainEvent
} from "electron";

import fs from "node:fs";
import path from "node:path";

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
            async (
                _event,
                defaultPath?: string,
            ) => {

                const result = await dialog.showOpenDialog({

                    ...(defaultPath && { defaultPath }),

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
            "show-save-image-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const options: Electron.SaveDialogOptions = {
                    title: "Save Image",
                    defaultPath: "image.png",

                    filters: [
                        {
                            name: "PNG Image",
                            extensions: ["png"],
                        },
                        {
                            name: "JPEG Image",
                            extensions: ["jpg", "jpeg"],
                        },
                        {
                            name: "WebP Image",
                            extensions: ["webp"],
                        },
                    ],
                };

                if (defaultPath) {
                    options.defaultPath = path.join(
                        defaultPath,
                        "image.png",
                    );
                }

                const result =
                    await dialog.showSaveDialog(options);

                if (
                    result.canceled ||
                    !result.filePath
                ) {
                    return null;
                }

                const extension =
                    path.extname(result.filePath)
                        .slice(1)
                        .toLowerCase() || "png";

                return {
                    filePath: result.filePath,
                    extension,
                };

            },
        );

        ipcMain.handle(
            "write-image",
            (
                _event,
                filePath: string,
                imageBytes: Uint8Array,
            ) => {

                fs.writeFileSync(
                    filePath,
                    Buffer.from(imageBytes),
                );

                return filePath;

            }
        );

        ipcMain.handle(
            "read-image",
            (
                _event,
                filePath: string,
            ) => {
                return new Uint8Array(
                    fs.readFileSync(filePath),
                );
            },
        );
    }

}