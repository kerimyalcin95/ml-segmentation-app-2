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
    filters: FilterState[];
}

interface DocumentState {

    width: number;
    height: number;
    rotation: number;

    flip: {
        horizontal: boolean;
        vertical: boolean;
    };

    crop: CropState;
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
    private outputImage?: Konva.Image;

    private readonly documentCanvas = document.createElement("canvas");
    private readonly documentContext;

    private readonly workCanvas = document.createElement("canvas");
    private readonly workContext;

    private readonly filterSourceCanvas = document.createElement("canvas");
    private readonly filterSourceContext;

    private readonly filterDestinationCanvas = document.createElement("canvas");
    private readonly filterDestinationContext;

    private imageState: ImageState = {
        width: 0,
        height: 0,

        filters: [],
    };

    private state: DocumentState = {
        width: 0,
        height: 0,

        rotation: 0,

        flip: {
            horizontal: false,
            vertical: false,
        },

        crop: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
    };

    constructor() {
        this._group = new Konva.Group();
        this._workspace = new Workspace();

        // Create document canvas context
        const documentContext = this.documentCanvas.getContext("2d");

        if (!documentContext) {
            throw new Error("Failed to create 2D rendering context.");
        }
        this.documentContext = documentContext;

        // Create work canvas context
        const workContext = this.workCanvas.getContext("2d");

        if (!workContext) {
            throw new Error("Failed to create 2D rendering context.");
        }
        this.workContext = workContext;

        // Create filter canvas contexts
        const filterSourceContext =
            this.filterSourceCanvas.getContext("2d");
        const filterDestinationContext =
            this.filterDestinationCanvas.getContext("2d");

        if (!filterSourceContext || !filterDestinationContext) {
            throw new Error("Failed to create filter rendering contexts.");
        }

        this.filterSourceContext = filterSourceContext;
        this.filterDestinationContext = filterDestinationContext;
    }

    // Functions

    private resetDocumentState() {
        this.state = {
            width: 0,
            height: 0,

            rotation: 0,

            flip: {
                horizontal: false,
                vertical: false,
            },

            crop: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }
    }

    private resetImageState() {
        this.imageState = {
            width: 0,
            height: 0,

            filters: [],
        }
    }

    private setImageSize(
        width: number,
        height: number,
    ): void {
        this.imageState.width = width;
        this.imageState.height = height;

        if (!this.outputImage) {
            return;
        }

        this.outputImage.setSize({
            width: width,
            height: height
        });

        this.outputImage.offset({
            x: width / 2,
            y: height / 2,
        });
    }

    setDocumentCrop(crop: CropState) {
        this.state.crop = {
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
        this.state.width = width;
        this.state.height = height;

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

    private applyNewWorkspaceSize(): void {

        // insert the size of the document (bounds)
        this.workspace.setBounds({
            x: 0,
            y: 0,
            width: this.state.width,
            height: this.state.height
        })
    }

    private centerInWorkspace(): void {
        this._group.position({
            x: this._workspace.width / 2,
            y: this._workspace.height / 2,
        });
    }

    setDocumentCanvasBitmap(bitmap: ImageBitmap) {

        this.documentCanvas.width = bitmap.width;
        this.documentCanvas.height = bitmap.height;

        this.documentContext.drawImage(
            bitmap,
            0,
            0,
            bitmap.width,
            bitmap.height
        );
    }

    setDocumentCanvasSize(width: number, height: number) {
        // warning: this resets the canvas
        this.documentCanvas.width = width;
        this.documentCanvas.height = height;
    }

    getWorkspaceSize() {
        return {
            width: this._workspace.width,
            height: this._workspace.height
        }
    }

    setWorkCanvasSize(width: number, height: number) {
        // warning: this resets the canvas
        this.workCanvas.width = width;
        this.workCanvas.height = height;
    }

    // Image operations

    public async loadImage(
        imageBytes: Uint8Array,
    ): Promise<void> {

        this.resetImageState();
        this.resetDocumentState();

        const blob = new Blob([
            imageBytes.buffer as ArrayBuffer,
        ]);

        const bitmap = await createImageBitmap(blob);

        this.state.crop = {
            x: 0,
            y: 0,
            width: bitmap.width,
            height: bitmap.height,
        };

        this._group.destroyChildren();

        this.outputImage = new Konva.Image({
            image: bitmap,
            x: 0,
            y: 0,
            width: bitmap.width,
            height: bitmap.height,
            offsetX: bitmap.width / 2,
            offsetY: bitmap.height / 2,
            listening: false,
        });

        this.setDocumentCanvasBitmap(bitmap);
        this.setImageSize(bitmap.width, bitmap.height);
        this.setDocumentSize(bitmap.width, bitmap.height);

        this._group.add(this.outputImage);

        this.applyNewWorkspaceSize();
        this.centerInWorkspace();

        this._events.emit("cameraRefresh");
        this._events.emit("cameraCenter");
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

    resizeImage(
        width: number,
        height: number,
    ): void {
        if (!this.outputImage) {
            return;
        }

        // Scale into work canvas.
        this.setWorkCanvasSize(width, height);
        this.workContext.drawImage(
            this.documentCanvas,
            0,
            0,
            this.documentCanvas.width,
            this.documentCanvas.height,
            0,
            0,
            width,
            height,
        );

        // Replace the document image.
        this.setDocumentCanvasSize(width, height);
        this.documentContext.drawImage(
            this.workCanvas,
            0,
            0,
        );

        this.outputImage.image(this.documentCanvas);

        this.setImageSize(width, height);
        this.setDocumentSize(width, height);
        this.setDocumentCrop({
            x: 0,
            y: 0,
            width: width,
            height: height
        });

        this.applyNewWorkspaceSize();
        this.centerInWorkspace();

        this.applyImageFilters();

        this._events.emit("cameraRefresh");
        this._events.emit("cameraCenter");
    }

    cropImage(
        x: number = 0,
        y: number = 0,
        width: number,
        height: number,
    ): void {
        if (!this.outputImage) {
            return;
        }

        // Copy the selected region into the work canvas.
        this.setWorkCanvasSize(width, height);

        this.workContext.drawImage(
            this.documentCanvas,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        // Replace the document image.
        this.setDocumentCanvasSize(width, height);

        this.documentContext.drawImage(
            this.workCanvas,
            0,
            0,
        );

        this.outputImage.image(this.documentCanvas);

        this.setImageSize(width, height);
        this.setDocumentSize(width, height);
        this.setDocumentCrop({
            x: 0,
            y: 0,
            width,
            height,
        });

        this.applyNewWorkspaceSize();
        this.centerInWorkspace();

        this.applyImageFilters();

        this._events.emit("cameraRefresh");
        this._events.emit("cameraCenter");
    }

    rotateImage90(clockwise: boolean = true) {
        if (!this.outputImage) return;

        /* 
        * clear workCanvas, translate origin to midpoint, rotate CW or CCW,
        * clear documentCanvas, copy workCanvas into documentCanvas,
        * replace outputImage with documentCanvas
        */
        this.setWorkCanvasSize(this.state.height, this.state.width);
        this.workContext.translate(
            this.workCanvas.width / 2,
            this.workCanvas.height / 2,
        );

        this.workContext.rotate(clockwise ? Math.PI / 2 : -Math.PI / 2);

        this.workContext.drawImage(
            this.documentCanvas,
            -this.documentCanvas.width / 2,
            -this.documentCanvas.height / 2,
        );

        this.setDocumentCanvasSize(this.workCanvas.width, this.workCanvas.height);
        this.documentContext.drawImage(
            this.workCanvas,
            0,
            0,
        );

        this.outputImage.image(this.documentCanvas);

        this.setDocumentSize(this.state.height, this.state.width);
        this.setImageSize(this.imageState.height, this.imageState.width);

        // set the new rotation state
        if (clockwise) {
            this.state.rotation += 90
        }
        else {
            this.state.rotation -= 90;
        }

        this.applyNewWorkspaceSize();
        this.centerInWorkspace();

        this.applyImageFilters();

        this._events.emit("cameraRefresh");
    }

    flipImage(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.outputImage) return;

        /* 
        * clear workCanvas, translate origin one width or height, 
        * scale to negative direction,
        * clear documentCanvas, copy workCanvas into documentCanvas,
        * replace outputImage with documentCanvas
        */
        this.setWorkCanvasSize(this.documentCanvas.width, this.documentCanvas.height);
        this.workContext.translate(
            horizontal ? this.workCanvas.width : 0,
            vertical ? this.workCanvas.height : 0,
        );

        this.workContext.scale(
            horizontal ? -1 : 1,
            vertical ? -1 : 1,
        );

        this.workContext.drawImage(
            this.documentCanvas,
            0,
            0,
        );

        this.setDocumentCanvasSize(this.workCanvas.width, this.workCanvas.height);
        this.documentContext.drawImage(
            this.workCanvas,
            0,
            0,
        );

        this.outputImage.image(this.documentCanvas);

        if (horizontal) {
            this.state.flip.horizontal =
                !this.state.flip.horizontal;
        }

        if (vertical) {
            this.state.flip.vertical =
                !this.state.flip.vertical;
        }

        this.applyNewWorkspaceSize();
        this.centerInWorkspace();

        this.applyImageFilters();

        this._events.emit("cameraRefresh");
    }

    // Filter

    addFilter(filter: FilterState): void {
        this.imageState.filters.push(filter);

        this.applyImageFilters();
    }

    setFilters(filters: FilterState[]): void {
        this.imageState.filters = [...filters];

        this.applyImageFilters();
    }

    private configureFilter(
        image: Konva.Image,
        filter: FilterState,
    ): ImageFilter | null {

        switch (filter.type) {
            case FilterType.Blur:
                image.blurRadius(filter.blurRadius);
                return Konva.Filters.Blur;

            case FilterType.Brighten:
                image.brightness(filter.brightness);
                return Konva.Filters.Brighten;

            case FilterType.Contrast:
                image.contrast(filter.contrast);
                return Konva.Filters.Contrast;

            case FilterType.Enhance:
                image.enhance(filter.enhance);
                return Konva.Filters.Enhance;

            case FilterType.Grayscale:
                return Konva.Filters.Grayscale;

            case FilterType.HSL:
                image.hue(filter.hue);
                image.saturation(filter.saturation);
                image.luminance(filter.luminance);
                return Konva.Filters.HSL;

            case FilterType.Invert:
                return Konva.Filters.Invert;

            case FilterType.Mask:
                image.threshold(filter.threshold);
                return Konva.Filters.Mask;

            case FilterType.Noise:
                image.noise(filter.noise);
                return Konva.Filters.Noise;

            case FilterType.Pixelate:
                image.pixelSize(filter.pixelSize);
                return Konva.Filters.Pixelate;

            case FilterType.Posterize:
                image.levels(filter.levels);
                return Konva.Filters.Posterize;

            case FilterType.RGB:
                image.red(filter.red);
                image.green(filter.green);
                image.blue(filter.blue);
                return Konva.Filters.RGB;

            case FilterType.Sepia:
                return Konva.Filters.Sepia;

            case FilterType.Solarize:
                return Konva.Filters.Solarize;

            case FilterType.Threshold:
                image.threshold(filter.threshold);
                return Konva.Filters.Threshold;

            default:
                return null;
        }
    }

    private applyImageFilters(): void {
        if (!this.outputImage) {
            return;
        }

        if (
            this.filterSourceCanvas.width !== this.documentCanvas.width ||
            this.filterSourceCanvas.height !== this.documentCanvas.height
        ) {
            this.filterSourceCanvas.width = this.documentCanvas.width;
            this.filterSourceCanvas.height = this.documentCanvas.height;
        }

        if (
            this.filterDestinationCanvas.width !== this.documentCanvas.width ||
            this.filterDestinationCanvas.height !== this.documentCanvas.height
        ) {
            this.filterDestinationCanvas.width = this.documentCanvas.width;
            this.filterDestinationCanvas.height = this.documentCanvas.height;
        }

        const sourceContext = this.filterSourceContext;
        const destinationContext = this.filterDestinationContext;

        const padding = 64; // or compute from the filter

        sourceContext.clearRect(
            0,
            0,
            this.filterSourceCanvas.width,
            this.filterSourceCanvas.height,
        );

        sourceContext.drawImage(
            this.documentCanvas,
            0,
            0,
        );

        this.outputImage.clearCache();

        // Image filtering pipeline
        for (const filter of this.imageState.filters) {

            const konvaFilter = this.configureFilter(
                this.outputImage,
                filter,
            );

            if (!konvaFilter) {
                continue;
            }

            this.outputImage.image(this.filterSourceCanvas);
            this.outputImage.filters([konvaFilter]);
            this.outputImage.cache({
                x: -padding,
                y: -padding,
                width: this.documentCanvas.width + padding * 2,
                height: this.documentCanvas.height + padding * 2,
            });

            destinationContext.clearRect(
                0,
                0,
                this.filterDestinationCanvas.width,
                this.filterDestinationCanvas.height,
            );

            // Draw the previous image.
            destinationContext.globalAlpha = 1;
            destinationContext.globalCompositeOperation = "source-over";

            destinationContext.drawImage(
                this.filterSourceCanvas,
                0,
                0,
            );

            // Blend the filtered image over it.
            destinationContext.globalAlpha = filter.opacity;
            destinationContext.globalCompositeOperation =
                filter.blendMode;

            destinationContext.drawImage(
                this.outputImage.toCanvas({
                    pixelRatio: 1,
                }),
                0,
                0,
                this.filterSourceCanvas.width,
                this.filterSourceCanvas.height,
            );

            destinationContext.globalAlpha = 1;
            destinationContext.globalCompositeOperation = "source-over";

            // Clear cache, otherwise opacity and blendmode will not work
            this.outputImage.filters([]);
            this.outputImage.clearCache();

            sourceContext.clearRect(
                0,
                0,
                this.filterSourceCanvas.width,
                this.filterSourceCanvas.height,
            );

            sourceContext.drawImage(
                this.filterDestinationCanvas,
                0,
                0,
            );
        }

        // Do not overwrite the document canvas
        // this.documentContext.clearRect(
        //     0,
        //     0,
        //     this.documentCanvas.width,
        //     this.documentCanvas.height,
        // );

        // this.documentContext.drawImage(
        //     this.filterSourceCanvas,
        //     0,
        //     0,
        // );

        this.outputImage.image(this.filterSourceCanvas);

        this._events.emit("layerRedraw");
    }
}