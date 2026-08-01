import Konva from 'konva';

import mitt from "mitt";
import type { CanvasEvents } from "./events";
import { CONTEXT, contextContainer } from "./container"
import { Camera } from "./camera";
import { type FilterState, FilterType } from '$lib/types/filter';
import { Workspace } from './workspace';

interface CropState {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageState {
    width: number;
    height: number;
    crop: CropState;
    filters: FilterState[];
}

interface DocumentState {
    size: {
        width: number;
        height: number;
    };
    rotation: number;

    flip: {
        horizontal: boolean;
        vertical: boolean;
    };
}

interface KonvaCanvasCache {
    scene: {
        _canvas: HTMLCanvasElement;
    };
}

type ImageFilters = Parameters<Konva.Image["filters"]>[0];
type ImageFilter = NonNullable<ImageFilters>[number];

export class Document {

    // Getter/Setter variables
    private readonly _group: Konva.Group;
    private _workspace: Workspace;
    private readonly _events = mitt<CanvasEvents>();

    get group(): Konva.Group {
        return this._group;
    }

    get workspace(): Workspace {
        return this._workspace;
    }

    get events() {
        return this._events;
    }

    // Private member variables
    private image?: Konva.Image;

    private htmlImage?: HTMLImageElement;
    private readonly documentCanvas = document.createElement("canvas");
    private readonly documentContext;

    private imageState: ImageState = {
        width: 0,
        height: 0,

        crop: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },

        filters: [],
    };

    private state: DocumentState = {
        size: {
            width: 0,
            height: 0,
        },

        rotation: 0,

        flip: {
            horizontal: false,
            vertical: false,
        },
    };

    constructor() {
        this._group = new Konva.Group();

        const context = this.documentCanvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to create 2D rendering context.");
        }

        this.documentContext = context;

        this._workspace = new Workspace();
    }

    // Functions

    private apply() {

        this._group.rotation(
            this.state.rotation
        );

        this._group.scale({
            x: this.state.flip.horizontal ? -1 : 1,
            y: this.state.flip.vertical ? -1 : 1,
        });

        this.updateDocumentTransformOrigin();
    }

    private updateDocumentTransformOrigin(): void {

        const rotated =
            Math.abs(this.state.rotation) % 180 === 90;

        const width =
            rotated
                ? this.imageState.height
                : this.imageState.width;

        const height =
            rotated
                ? this.imageState.width
                : this.imageState.height;

        this.setDocumentSize(width, height);
    }

    private async commitDocumentCanvas(): Promise<void> {

        const blob = await new Promise<Blob>((resolve, reject) => {

            this.documentCanvas.toBlob((blob) => {

                if (!blob) {
                    reject(new Error("Failed to create image blob."));
                    return;
                }

                resolve(blob);

            });

        });

        const url = URL.createObjectURL(blob);

        try {

            const image = new window.Image();

            await new Promise<void>((resolve, reject) => {

                image.onload = () => {
                    resolve();
                };

                image.onerror = () => {
                    reject(new Error("Failed to load image."));
                };

                image.src = url;

            });

            this.htmlImage = image;

        } finally {

            URL.revokeObjectURL(url);

        }

    }

    private setImageSize(
        width: number,
        height: number,
    ): void {
        this.imageState.width = width;
        this.imageState.height = height;

        if (!this.image) {
            return;
        }

        this.image.setSize({
            width: width,
            height: height
        });

        this.image.offset({
            x: width / 2,
            y: height / 2,
        });
    }

    setImageCrop(crop: CropState) {
        this.imageState.crop = {
            x: crop.x,
            y: crop.y,
            width: crop.width,
            height: crop.height
        }
    }

    private setDocumentSize(
        width: number,
        height: number,
    ): void {
        this.state.size.width = width;
        this.state.size.height = height;

        this._group.offsetX(0);
        this._group.offsetY(0);

        this._group.setSize({
            width: width,
            height: height
        });

        this._events.emit("documentResize", {
            width: width,
            height: height
        })
    }

    private applyWorkspace(): void {

        // insert the size of the document (bounds)
        this.workspace.setBounds({
            x: 0,
            y: 0,
            width: this.state.size.width,
            height: this.state.size.height
        })
    }

    private centerInWorkspace(): void {
        this._group.position({
            x: this._workspace.width / 2,
            y: this._workspace.height / 2,
        });
    }

    getWorkspaceSize() {
        return {
            width: this._workspace.width,
            height: this._workspace.height
        }
    }

    // Rendering

    private prepareRenderCanvas(): void {
        this.documentCanvas.width = this.imageState.width;
        this.documentCanvas.height = this.imageState.height;

        this.documentContext.clearRect(
            0,
            0,
            this.documentCanvas.width,
            this.documentCanvas.height,
        );
    }

    private updateImageNode(): void {
        if (!this.image) {
            return;
        }

        this.image.image(this.documentCanvas);

        this.image.width(this.imageState.width);
        this.image.height(this.imageState.height);

        this.image.offsetX(this.imageState.width / 2);
        this.image.offsetY(this.imageState.height / 2);
    }

    private renderImage(): void {
        this.prepareRenderCanvas();
        this.drawImage();
        this.updateImageNode();
        this.applyImageFilters();

        this._events.emit("layerRedraw");
    }

    private drawImage(): void {
        if (!this.htmlImage) {
            return;
        }

        const crop = this.imageState.crop;

        this.documentContext.drawImage(
            this.htmlImage,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            this.imageState.width,
            this.imageState.height,
        );
    }

    // Image operations

    public loadImage(
        imageBytes: Uint8Array,
    ): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            const blob = new Blob([
                imageBytes.buffer as ArrayBuffer,
            ]);

            const cleanup = () => {
                URL.revokeObjectURL(url);
            };

            const url = URL.createObjectURL(blob);

            const image = new window.Image();

            image.onload = () => {
                this.htmlImage = image;

                this.imageState.crop = {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                };

                this._group.destroyChildren();

                this.image = new Konva.Image({
                    image: this.documentCanvas,
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                    offsetX: image.width / 2,
                    offsetY: image.height / 2,
                    listening: false,
                });

                this.setImageSize(image.width, image.height);

                this._group.add(
                    this.image
                );

                this.renderImage();
                this.apply();
                this.applyWorkspace();
                this.centerInWorkspace();

                this._events.emit("cameraRefresh");
                this._events.emit("cameraCenter");

                cleanup();
                resolve();
            };

            image.onerror = (_event) => {
                cleanup();
                reject(
                    new Error(
                        "Failed to load image from blob."
                    )
                );
            };

            image.src = url;
        });
    }

    async saveImage(
        mimeType: string = "image/png",
        quality?: number,
    ): Promise<Uint8Array> {

        const camera =
            contextContainer.resolve<Camera>(CONTEXT.Camera);

        const stage =
            contextContainer.resolve<Konva.Stage>(CONTEXT.MainStage);

        const oldScale = camera.group.scale();
        const oldPosition = camera.group.position();

        camera.group.scale({
            x: 1,
            y: 1,
        });

        camera.group.position({
            x: 0,
            y: 0,
        });

        const bounds =
            this._group.getClientRect();

        const canvas =
            stage.toCanvas({
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                pixelRatio: 1,
            });

        camera.group.scale(oldScale);
        camera.group.position(oldPosition);

        this._events.emit("layerRedraw");

        const blob =
            await new Promise<Blob>((resolve, reject) => {

                canvas.toBlob(

                    (blob) => {

                        if (!blob) {
                            reject(
                                new Error(
                                    "Failed to create image blob."
                                )
                            );

                            return;
                        }

                        resolve(blob);

                    },

                    mimeType,
                    quality,

                );

            });

        return new Uint8Array(
            await blob.arrayBuffer()
        );

    }

    async resizeImage(width: number, height: number) {
        this.setImageSize(width, height);
        this.renderImage();

        await this.commitDocumentCanvas();

        this.setImageCrop({
            x: 0,
            y: 0,
            width: width,
            height: height
        });

        this.apply();
        this.applyWorkspace();
        this.centerInWorkspace();

        this._events.emit("cameraRefresh");
        this._events.emit("cameraCenter");
    }

    async cropImage(
        x: number = 0,
        y: number = 0,
        width: number,
        height: number
    ): Promise<void> {
        if (!this.image) return;

        this.setImageCrop({
            x: x,
            y: y,
            width: width,
            height: height
        })
        this.setImageSize(width, height);
        this.renderImage();

        await this.commitDocumentCanvas();

        this.apply();
        this.applyWorkspace();
        this.centerInWorkspace();

        this._events.emit("cameraRefresh");
        this._events.emit("cameraCenter");
    }

    rotateImage(angle: number) {

        this.state.rotation =
            (
                this.state.rotation + angle
            ) % 360;

        this.apply();
        this.applyWorkspace();
        this.centerInWorkspace();

        this._events.emit("cameraRefresh");
    }

    flipImage(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.image) return;

        if (horizontal) {
            this.state.flip.horizontal =
                !this.state.flip.horizontal;
        }

        if (vertical) {
            this.state.flip.vertical =
                !this.state.flip.vertical;
        }

        this.apply();
        this.applyWorkspace();
        this.centerInWorkspace();

        this.image.cache();
        this._events.emit("cameraRefresh");
    }

    // Filter

    addFilter(filter: FilterState): void {
        this.imageState.filters.push(filter);

        this.renderImage();
    }

    setFilters(filters: FilterState[]): void {
        this.imageState.filters = [...filters];

        this.renderImage();
    }

    private configureFilter(
        filter: FilterState,
    ): ImageFilter | null {
        if (!this.image) {
            return null;
        }

        switch (filter.type) {
            case FilterType.Blur:
                this.image.blurRadius(filter.blurRadius);
                return Konva.Filters.Blur;

            case FilterType.Brighten:
                this.image.brightness(filter.brightness);
                return Konva.Filters.Brighten;

            case FilterType.Contrast:
                this.image.contrast(filter.contrast);
                return Konva.Filters.Contrast;

            case FilterType.Enhance:
                this.image.enhance(filter.enhance);
                return Konva.Filters.Enhance;

            case FilterType.Grayscale:
                return Konva.Filters.Grayscale;

            case FilterType.HSL:
                this.image.hue(filter.hue);
                this.image.saturation(filter.saturation);
                this.image.luminance(filter.luminance);
                return Konva.Filters.HSL;

            case FilterType.Invert:
                return Konva.Filters.Invert;

            case FilterType.Mask:
                this.image.threshold(filter.threshold);
                return Konva.Filters.Mask;

            case FilterType.Noise:
                this.image.noise(filter.noise);
                return Konva.Filters.Noise;

            case FilterType.Pixelate:
                this.image.pixelSize(filter.pixelSize);
                return Konva.Filters.Pixelate;

            case FilterType.Posterize:
                this.image.levels(filter.levels);
                return Konva.Filters.Posterize;

            case FilterType.RGB:
                this.image.red(filter.red);
                this.image.green(filter.green);
                this.image.blue(filter.blue);
                return Konva.Filters.RGB;

            case FilterType.Sepia:
                return Konva.Filters.Sepia;

            case FilterType.Solarize:
                return Konva.Filters.Solarize;

            case FilterType.Threshold:
                this.image.threshold(filter.threshold);
                return Konva.Filters.Threshold;

            default:
                return null;
        }
    }

    private applyImageFilters(): void {
        if (!this.image) {
            return;
        }

        this.image.filters([]);
        this.image.clearCache();

        for (const filter of this.imageState.filters) {
            const konvaFilter = this.configureFilter(filter);

            if (!konvaFilter) {
                continue;
            }

            // Use the current document as the source image.
            this.image.image(this.documentCanvas);

            // Apply exactly one filter.
            this.image.filters([konvaFilter]);
            this.image.cache();

            const cache = (
                this.image as unknown as {
                    _cache: Map<string, unknown>;
                }
            )._cache;

            const canvasCache =
                cache.get("canvas") as KonvaCanvasCache;

            const filteredCanvas =
                canvasCache.scene._canvas;

            // -----------------------------------------------------------------
            // Temporary implementation:
            // Replace the document with the filtered result.
            // (No opacity / blend mode yet.)
            // -----------------------------------------------------------------

            this.documentContext.setTransform(
                1,
                0,
                0,
                1,
                0,
                0,
            );

            this.documentContext.globalAlpha = 1;
            this.documentContext.globalCompositeOperation = "source-over";

            this.documentContext.clearRect(
                0,
                0,
                this.documentCanvas.width,
                this.documentCanvas.height,
            );

            this.documentContext.drawImage(
                filteredCanvas,
                0,
                0,
            );

            this.image.clearCache();
            this.image.filters([]);
        }

        this.image.image(this.documentCanvas);
    }
}