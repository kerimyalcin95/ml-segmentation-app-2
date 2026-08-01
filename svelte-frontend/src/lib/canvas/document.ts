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

type ImageFilters = Parameters<Konva.Image["filters"]>[0];

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
    private imageNode?: Konva.Image;

    private originalImage?: HTMLImageElement;
    private readonly documentCanvas = document.createElement("canvas");
    private readonly documentContext;

    __camera: Camera | null; // DEBUG

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

        this.__camera = null; // DEBUG
        this.documentContext = context;
        this._workspace = new Workspace();
    }

    // Functions
    private getDocumentBounds() {
        const camera = contextContainer.resolve<Camera>(CONTEXT.Camera);
        const rect =
            this._group.getClientRect({
                relativeTo: camera.group,
            });

        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }

    getDocumentBoundsSize() {
        const bounds = this.getDocumentBounds();

        return {
            width: bounds.width,
            height: bounds.height,
        };
    }

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

        if (!this.imageNode) {
            return;
        }

        this.imageNode.offset({
            x: width / 2,
            y: height / 2,
        });
    }

    private updateDocumentState(
        width: number,
        height: number,
    ): void {
        this.imageState.width = width;
        this.imageState.height = height;

        this.state.size.width = width;
        this.state.size.height = height;
    }

    private updateWorkspace(): void {
        const bounds = this.getDocumentBoundsSize();

        this.workspace.setBounds({
            x: 0,
            y: 0,
            width: bounds.width + 2 * this.workspace.margin,
            height: bounds.height + 2 * this.workspace.margin
        })

        this._events.emit("workspaceResize", { width: this.workspace.width, height: this.workspace.height });
    }

    private centerInWorkspace(): void {
        this._group.position({
            x: this.workspace.width / 2,
            y: this.workspace.height / 2,
        });
    }

    getWorkspaceBoundsSize() {
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
        if (!this.imageNode) {
            return;
        }

        this.imageNode.image(this.documentCanvas);

        this.imageNode.width(this.imageState.width);
        this.imageNode.height(this.imageState.height);

        this.imageNode.offsetX(this.imageState.width / 2);
        this.imageNode.offsetY(this.imageState.height / 2);
    }

    private renderImage(): void {
        if (!this.originalImage) return;
        if (!this.imageNode) return;

        this.prepareRenderCanvas();

        this.drawImage();

        this.updateImageNode();

        this.applyImageFilters();

        this._events.emit("layerRedraw");
    }

    private drawImage(): void {
        if (!this.originalImage) {
            return;
        }

        const crop = this.imageState.crop;

        this.documentContext.drawImage(
            this.originalImage,
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
                this.originalImage = image;

                this.imageState.crop = {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                };

                this.updateDocumentState(image.width, image.height);

                this._group.destroyChildren();

                this.imageNode = new Konva.Image({
                    image: this.documentCanvas,
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                    offsetX: image.width / 2,
                    offsetY: image.height / 2,
                    listening: false,
                });

                this._group.position({
                    x: image.width / 2,
                    y: image.height / 2,
                });

                this._group.add(
                    this.imageNode
                );

                this.renderImage();
                this.apply();
                this.updateWorkspace();
                this.centerInWorkspace();

                this._events.emit("documentResize", {
                    width: image.width,
                    height: image.height,
                });

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

    resizeImage(width: number, height: number) {
        this.updateDocumentState(width, height);

        this.renderImage();

        this.apply();
        this.updateWorkspace();
        this.centerInWorkspace();

        const size = this.getDocumentBoundsSize();

        this._events.emit("documentResize", {
            width: size.width,
            height: size.height,
        });

        this._events.emit("cameraRefresh");
    }

    cropImage(
        x: number = 0,
        y: number = 0,
        width: number,
        height: number
    ) {
        if (!this.imageNode) return;

        this.imageState.crop = {
            x,
            y,
            width,
            height,
        };

        this.updateDocumentState(width, height);

        this.renderImage();

        this.apply();
        this.updateWorkspace();
        this.centerInWorkspace();

        this._events.emit("documentResize", {
            width: width,
            height: height,
        });

        this._events.emit("cameraRefresh");
    }

    rotateImage(angle: number) {

        this.state.rotation =
            (
                this.state.rotation + angle
            ) % 360;

        this.apply();
        this.updateWorkspace();
        this.centerInWorkspace();

        this._events.emit("documentResize", {
            width: this.getDocumentBoundsSize().width,
            height: this.getDocumentBoundsSize().height
        });

        this._events.emit("cameraCenter");
    }

    flipImage(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.imageNode) return;

        if (horizontal) {
            this.state.flip.horizontal =
                !this.state.flip.horizontal;
        }

        if (vertical) {
            this.state.flip.vertical =
                !this.state.flip.vertical;
        }

        this.apply();
        this.updateWorkspace();
        this.centerInWorkspace();

        this.imageNode.cache();
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

    private applyImageFilters(): void {
        if (!this.imageNode) {
            return;
        }

        const filters: NonNullable<ImageFilters> = [];

        for (const filter of this.imageState.filters) {
            switch (filter.type) {
                case FilterType.Blur:
                    this.imageNode.blurRadius(filter.blurRadius);
                    filters.push(Konva.Filters.Blur);
                    break;

                case FilterType.Brighten:
                    this.imageNode.brightness(filter.brightness);
                    filters.push(Konva.Filters.Brighten);
                    break;

                case FilterType.Contrast:
                    this.imageNode.contrast(filter.contrast);
                    filters.push(Konva.Filters.Contrast);
                    break;

                case FilterType.Enhance:
                    this.imageNode.enhance(filter.enhance);
                    filters.push(Konva.Filters.Enhance);
                    break;

                case FilterType.Grayscale:
                    filters.push(Konva.Filters.Grayscale);
                    break;

                case FilterType.HSL:
                    this.imageNode.hue(filter.hue);
                    this.imageNode.saturation(filter.saturation);
                    this.imageNode.luminance(filter.luminance);
                    filters.push(Konva.Filters.HSL);
                    break;

                case FilterType.Invert:
                    filters.push(Konva.Filters.Invert);
                    break;

                case FilterType.Mask:
                    this.imageNode.threshold(filter.threshold);
                    filters.push(Konva.Filters.Mask);
                    break;

                case FilterType.Noise:
                    this.imageNode.noise(filter.noise);
                    filters.push(Konva.Filters.Noise);
                    break;

                case FilterType.Pixelate:
                    this.imageNode.pixelSize(filter.pixelSize);
                    filters.push(Konva.Filters.Pixelate);
                    break;

                case FilterType.Posterize:
                    this.imageNode.levels(filter.levels);
                    filters.push(Konva.Filters.Posterize);
                    break;

                case FilterType.RGB:
                    this.imageNode.red(filter.red);
                    this.imageNode.green(filter.green);
                    this.imageNode.blue(filter.blue);
                    filters.push(Konva.Filters.RGB);
                    break;

                case FilterType.Sepia:
                    filters.push(Konva.Filters.Sepia);
                    break;

                case FilterType.Solarize:
                    filters.push(Konva.Filters.Solarize);
                    break;

                case FilterType.Threshold:
                    this.imageNode.threshold(filter.threshold);
                    filters.push(Konva.Filters.Threshold);
                    break;
            }
        }

        this.imageNode.filters(filters);
        this.imageNode.cache();
    }
}