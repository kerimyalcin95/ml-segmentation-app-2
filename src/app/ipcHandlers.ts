import {
    app,
    dialog,
    ipcMain,
    IpcMainEvent,
} from "electron";

import fs from "node:fs";
import path from "node:path";
import PNGlib from "node-pnglib";
import { decode } from 'fast-png';

import { PythonServer } from "../python/pythonServer.js";

export class IpcHandlers {

    public constructor(
        private readonly pythonServer: PythonServer
    ) { }

    public register(): void {

        ipcMain.handle(
            "load-session",
            () => {
                const filePath = path.join(
                    app.getPath("userData"),
                    "sessionStore.json",
                );

                if (!fs.existsSync(filePath)) {
                    return null;
                }

                const json =
                    fs.readFileSync(
                        filePath,
                        "utf8",
                    );

                return JSON.parse(json) as unknown;
            },
        );

        ipcMain.handle(
            "save-session",
            (
                _event,
                session: unknown,
            ) => {
                const filePath = path.join(
                    app.getPath("userData"),
                    "sessionStore.json",
                );

                fs.writeFileSync(
                    filePath,
                    JSON.stringify(
                        session,
                        null,
                        4,
                    ),
                    "utf8",
                );
            },
        );

        ipcMain.handle(
            "restart-python-server",
            async (
                _event,
                port: number,
            ) => {
                if (
                    !Number.isInteger(port) ||
                    port < 1024 ||
                    port > 65535
                ) {
                    throw new Error(
                        "Port must be an integer between 1024 and 65535."
                    );
                }

                await this.pythonServer.restart(port);
            },
        );

        ipcMain.handle(
            "get-python-server-error",
            () => {
                const error =
                    this.pythonServer.getPendingError();

                this.pythonServer.clearPendingError();

                return error;
            },
        );

        ipcMain.on(
            "send-to-server",
            (_event: IpcMainEvent, message: string) => {
                this.pythonServer.send(message);
            }
        );

        ipcMain.on(
            "renderer-log",
            (_event: IpcMainEvent, ...args: unknown[]) => {
                console.log(...args);
            }
        );

        ipcMain.handle(
            "show-open-image-dialog",
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

        ipcMain.handle(
            "show-open-label-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const result = await dialog.showOpenDialog({

                    ...(defaultPath && { defaultPath }),

                    properties: ["openFile"],

                    filters: [

                        {
                            name: "Label Files",
                            extensions: ["json"],
                        },

                    ],

                });

                if (result.canceled) {
                    return null;
                }

                return result.filePaths[0];

            },
        );

        ipcMain.handle(
            "show-save-label-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const options: Electron.SaveDialogOptions = {
                    title: "Save Labels",
                    defaultPath: "labels.json",

                    filters: [
                        {
                            name: "Label Files",
                            extensions: ["json"],
                        },
                    ],
                };

                if (defaultPath) {
                    options.defaultPath = path.join(
                        defaultPath,
                        "labels.json",
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

                return {
                    filePath: result.filePath,
                };

            },
        );

        ipcMain.handle(
            "write-labels",
            (
                _event,
                filePath: string,
                json: string,
            ) => {
                fs.writeFileSync(filePath, json, "utf8");
            },
        );

        ipcMain.handle(
            "read-labels",
            (
                _event,
                filePath: string,
            ) => {
                return fs.readFileSync(filePath, "utf8");
            },
        );

        ipcMain.handle(
            "show-open-label-image-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const result =
                    await dialog.showOpenDialog({

                        ...(defaultPath && { defaultPath }),

                        properties: ["openFile"],

                        filters: [
                            {
                                name: "Label Images",
                                extensions: ["png"],
                            },
                        ],
                    });

                if (result.canceled) {
                    return null;
                }

                return result.filePaths[0];
            },
        );

        ipcMain.handle(
            "show-save-label-image-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const options: Electron.SaveDialogOptions = {
                    title: "Save Label Image",
                    defaultPath: "label-image.png",

                    filters: [
                        {
                            name: "PNG Label Image",
                            extensions: ["png"],
                        },
                    ],
                };

                if (defaultPath) {
                    options.defaultPath = path.join(
                        defaultPath,
                        "label-image.png",
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

                return {
                    filePath: result.filePath,
                    extension: "png",
                };
            },
        );

        ipcMain.handle(
            "read-label-image",
            (
                _event,
                filePath: string,
            ) => {
                const imageBytes =
                    fs.readFileSync(filePath);

                const image =
                    decode(imageBytes);

                if (
                    image.channels !== 1 ||
                    image.depth !== 8
                ) {
                    throw new Error(
                        "Label image must be an 8-bit indexed PNG.",
                    );
                }

                const palette =
                    image.palette;

                if (
                    palette === undefined ||
                    palette.length === 0
                ) {
                    throw new Error(
                        "Label image does not contain a palette.",
                    );
                }

                const expectedLength =
                    image.width *
                    image.height;

                if (
                    image.data.length !==
                    expectedLength
                ) {
                    throw new Error(
                        "Invalid label image pixel data.",
                    );
                }

                const mask =
                    new Uint8Array(
                        expectedLength,
                    );

                let highestLabelValue = -1;

                for (
                    let index = 0;
                    index < expectedLength;
                    index++
                ) {
                    const paletteIndex =
                        image.data[index];

                    if (
                        paletteIndex === undefined
                    ) {
                        throw new Error(
                            "Invalid label pixel value.",
                        );
                    }

                    /*
                     * PNG palette index 0 is the
                     * background.
                     *
                     * Internal canvas background is 255.
                     */
                    if (
                        paletteIndex === 0
                    ) {
                        mask[index] = 255;
                        continue;
                    }

                    /*
                     * PNG index 1 → canvas label 0
                     * PNG index 2 → canvas label 1
                     * ...
                     */
                    const labelValue =
                        paletteIndex - 1;

                    if (
                        labelValue > 254
                    ) {
                        throw new Error(
                            "Label image contains too many labels.",
                        );
                    }

                    if (
                        paletteIndex >=
                        palette.length
                    ) {
                        throw new Error(
                            "Label image contains a pixel " +
                            "without a corresponding palette color.",
                        );
                    }

                    mask[index] =
                        labelValue;

                    if (
                        labelValue >
                        highestLabelValue
                    ) {
                        highestLabelValue =
                            labelValue;
                    }
                }

                const labelCount =
                    highestLabelValue + 1;

                const labelPalette: string[] = [];

                for (
                    let index = 1;
                    index <= labelCount;
                    index++
                ) {
                    const color =
                        palette[index];

                    if (
                        color === undefined ||
                        color.length < 4
                    ) {
                        throw new Error(
                            "Invalid label palette entry.",
                        );
                    }

                    const red = color[0];
                    const green = color[1];
                    const blue = color[2];
                    const alpha = color[3];

                    if (
                        red === undefined ||
                        green === undefined ||
                        blue === undefined ||
                        alpha === undefined
                    ) {
                        throw new Error(
                            "Invalid label palette entry.",
                        );
                    }

                    if (
                        alpha !== 255
                    ) {
                        throw new Error(
                            "Label palette entries must be opaque.",
                        );
                    }

                    labelPalette.push(
                        "#" +
                        red
                            .toString(16)
                            .padStart(2, "0") +
                        green
                            .toString(16)
                            .padStart(2, "0") +
                        blue
                            .toString(16)
                            .padStart(2, "0"),
                    );
                }

                return {
                    width: image.width,
                    height: image.height,
                    mask,
                    palette: labelPalette,
                };
            },
        );

        ipcMain.handle(
            "write-label-image",
            (
                _event,
                width: number,
                height: number,
                mask: Uint8Array,
                palette: string[],
            ) => {
                if (
                    !Number.isInteger(width) ||
                    !Number.isInteger(height) ||
                    width <= 0 ||
                    height <= 0
                ) {
                    throw new Error(
                        "Invalid label image dimensions",
                    );
                }

                if (
                    mask.length !==
                    width * height
                ) {
                    throw new Error(
                        "Label mask dimensions do not match " +
                        "the supplied mask length.",
                    );
                }

                if (
                    palette.length === 0 ||
                    palette.length > 255
                ) {
                    throw new Error(
                        "Label palette must contain between " +
                        "1 and 255 colors.",
                    );
                }

                /*
                 * Mask values:
                 *
                 * 0 = background
                 * 1 = palette[0]
                 * 2 = palette[1]
                 * ...
                 */
                let highestLabelValue = 0;

                for (
                    let index = 0;
                    index < mask.length;
                    index++
                ) {
                    const value =
                        mask[index];

                    if (
                        value === undefined
                    ) {
                        throw new Error(
                            "Missing label value at pixel " +
                            String(index) +
                            ".",
                        );
                    }

                    if (
                        value > highestLabelValue
                    ) {
                        highestLabelValue =
                            value;
                    }
                }

                /*
                 * A mask value N requires palette[N - 1].
                 */
                if (
                    highestLabelValue >
                    palette.length
                ) {
                    throw new Error(
                        "The label mask contains a label without " +
                        "a corresponding palette color.",
                    );
                }

                const png =
                    new PNGlib(
                        width,
                        height,
                        8,
                        [0, 0, 0, 255],
                    );

                /*
                 * PNG palette index 0 is the background.
                 *
                 * png.color() starts registering additional
                 * colors after the background color.
                 */
                const paletteIndices =
                    new Uint8Array(
                        palette.length + 1,
                    );

                for (
                    let labelValue = 1;
                    labelValue <=
                    highestLabelValue;
                    labelValue++
                ) {
                    const color =
                        palette[
                        labelValue - 1
                        ];

                    if (
                        color === undefined
                    ) {
                        throw new Error(
                            "Missing palette color for label " +
                            String(labelValue - 1) +
                            ".",
                        );
                    }

                    paletteIndices[
                        labelValue
                    ] =
                        png.color(color);
                }

                /*
                 * Write palette indices into the PNG.
                 */
                for (
                    let index = 0;
                    index < mask.length;
                    index++
                ) {
                    const value =
                        mask[index];

                    if (
                        value === undefined
                    ) {
                        throw new Error(
                            "Missing label value at pixel " +
                            String(index) +
                            ".",
                        );
                    }

                    const x =
                        index % width;

                    const y =
                        Math.floor(
                            index / width,
                        );

                    /*
                     * Mask value 0 is the background,
                     * which is already PNG palette index 0.
                     */
                    if (
                        value === 0
                    ) {
                        png.buffer[
                            png.index(x, y)
                        ] = 0;

                        continue;
                    }

                    const paletteIndex =
                        paletteIndices[value];

                    if (
                        paletteIndex === undefined
                    ) {
                        throw new Error(
                            "Missing PNG palette index for label " +
                            String(value) +
                            ".",
                        );
                    }

                    png.buffer[
                        png.index(x, y)
                    ] =
                        paletteIndex;
                }

                return new Uint8Array(
                    png.getBuffer(),
                );
            },
        );

        ipcMain.handle(
            "show-open-directory-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const result =
                    await dialog.showOpenDialog({

                        ...(defaultPath && { defaultPath }),

                        properties: ["openDirectory"],

                    });

                if (result.canceled) {
                    return null;
                }

                return result.filePaths[0];

            },
        );

        ipcMain.handle(
            "show-open-model-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const result =
                    await dialog.showOpenDialog({

                        ...(defaultPath && { defaultPath }),

                        properties: ["openFile"],

                        filters: [
                            {
                                name: "Model Files",
                                extensions: ["pkl"],
                            },
                        ],

                    });

                if (result.canceled) {
                    return null;
                }

                return result.filePaths[0];

            },
        );

        ipcMain.handle(
            "show-save-model-dialog",
            async (
                _event,
                defaultPath?: string,
            ) => {

                const options: Electron.SaveDialogOptions = {
                    title: "Save Model",
                    defaultPath: "model.pkl",

                    filters: [
                        {
                            name: "Model Files",
                            extensions: ["pkl"],
                        },
                    ],
                };

                if (defaultPath) {
                    options.defaultPath = path.join(
                        defaultPath,
                        "model.pkl",
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

                return result.filePath;

            },
        );
    }

}