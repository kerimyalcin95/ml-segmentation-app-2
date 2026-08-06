import Konva from 'konva';

import mitt from "mitt";
import type { CanvasEvents } from "./events";
import { CONTEXT, contextContainer } from "./container"
import { Camera } from "./camera";
import { Workspace } from './workspace';
import { Image } from './image';
import { LabelImage } from "./label/labelImage";

export interface CropState {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DocumentState {

    width: number;
    height: number;
    rotation: number;

    flip: {
        horizontal: boolean;
        vertical: boolean;
    };

    crop: CropState;
}

export class Document {

    // Getter/Setter variables
    private readonly _group: Konva.Group;

    get group(): Konva.Group {
        return this._group;
    }

    private _workspace: Workspace;

    get workspace(): Workspace {
        return this._workspace;
    }

    private readonly _events = mitt<CanvasEvents>();

    get events() {
        return this._events;
    }

    private readonly _image: Image;

    get image() {
        return this._image;
    }

    private readonly _labelImage: LabelImage;

    get labelImage(): LabelImage {
        return this._labelImage;
    }

    private readonly sourceCanvas = document.createElement("canvas");
    private readonly sourceContext: CanvasRenderingContext2D;

    private readonly workCanvas = document.createElement("canvas");
    private readonly workContext: CanvasRenderingContext2D;

    private _state: DocumentState = {
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

    get state(): DocumentState {
        return this._state;
    }

    constructor() {
        this._group = new Konva.Group();
        this._workspace = new Workspace();
        this._labelImage = new LabelImage();

        // Create document canvas context
        const sourceContext = this.sourceCanvas.getContext("2d");

        if (!sourceContext) {
            throw new Error("Failed to create 2D rendering context.");
        }
        this.sourceContext = sourceContext;

        // Create work canvas context
        const workContext = this.workCanvas.getContext("2d");

        if (!workContext) {
            throw new Error("Failed to create 2D rendering context.");
        }

        this.workContext = workContext;

        this._image = new Image(
            this.sourceCanvas
        );

        this._image = new Image(
            this.sourceCanvas
        );
    }

    // Functions

    resetState() {
        this._state = {
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

    setCrop(crop: CropState) {
        this._state.crop = {
            x: crop.x,
            y: crop.y,
            width: crop.width,
            height: crop.height
        }
    }

    setSize(
        width: number,
        height: number,
    ): void {
        this._state.width = width;
        this._state.height = height;

        this._state.crop.width = width;
        this._state.crop.height = height;

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

        this._events.emit("documentState", { state: this._state });
    }

    applyNewWorkspaceSize(): void {

        // insert the size of the document (bounds)
        this.workspace.setBounds({
            x: 0,
            y: 0,
            width: this._state.width,
            height: this._state.height
        })
    }

    centerInWorkspace(): void {
        this._group.position({
            x: this._workspace.width / 2,
            y: this._workspace.height / 2,
        });
    }

    setCanvasBitmap(bitmap: ImageBitmap) {

        this.sourceCanvas.width = bitmap.width;
        this.sourceCanvas.height = bitmap.height;

        this.sourceContext.drawImage(
            bitmap,
            0,
            0,
            bitmap.width,
            bitmap.height
        );
    }

    setSourceCanvasSize(width: number, height: number) {
        // warning: this resets the canvas
        this.sourceCanvas.width = width;
        this.sourceCanvas.height = height;
    }

    private replaceSourceCanvasFromWorkCanvas(
        width: number,
        height: number,
    ): void {
        this.setSourceCanvasSize(width, height);

        this.sourceContext.drawImage(
            this.workCanvas,
            0,
            0,
        );

        this.image.outputImage?.image(
            this.sourceCanvas,
        );
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

    private refresh(options?: {
        workspace?: boolean;
        filters?: boolean;
        redraw?: boolean;
        cameraRefresh?: boolean;
        cameraCenter?: boolean;
    }) {
        const {
            workspace = true,
            filters = true,
            redraw = true,
            cameraRefresh = true,
            cameraCenter = true,
        } = options ?? {};

        if (workspace) {
            this.applyNewWorkspaceSize();
            this.centerInWorkspace();
        }

        if (filters) {
            this._image.applyFilters();
        }

        if (redraw) {
            this._events.emit("layerRedraw");
        }

        if (cameraRefresh) {
            this._events.emit("cameraRefresh");
        }

        if (cameraCenter) {
            this._events.emit("cameraCenter");
        }
    }

    // Image operations

    public async loadAsset(
        imageBytes: Uint8Array,
    ): Promise<void> {

        this.image.resetState();
        this.resetState();

        const blob = new Blob([
            imageBytes.buffer as ArrayBuffer,
        ]);

        const bitmap = await createImageBitmap(blob);

        this._state.crop = {
            x: 0,
            y: 0,
            width: bitmap.width,
            height: bitmap.height,
        };

        this._group.destroyChildren();

        this.setCanvasBitmap(bitmap);

        this.image.outputImage = new Konva.Image({
            image: this.sourceCanvas,
            x: 0,
            y: 0,
            width: this.sourceCanvas.width,
            height: this.sourceCanvas.height,
            offsetX: this.sourceCanvas.width / 2,
            offsetY: this.sourceCanvas.height / 2,
            listening: false,
        });

        this.image.setSize(bitmap.width, bitmap.height);
        this.setSize(bitmap.width, bitmap.height);

        this._group.add(this.image.outputImage);

        this.refresh({
            redraw: false,
            filters: false
        })
    }

    async saveAsset(
        mimeType: string = "image/png",
        quality?: number,
    ): Promise<Uint8Array> {
        const camera =
            contextContainer.resolve<Camera>(CONTEXT.Camera);

        const stage =
            contextContainer.resolve<Konva.Stage>(CONTEXT.MainStage);

        const oldScale = camera.group.scale();
        const oldPosition = camera.group.position();

        const uiLayer = stage.getLayers().at(-1);
        const uiLayerVisible = uiLayer?.visible() ?? false;

        uiLayer?.visible(false);

        camera.group.scale({ x: 1, y: 1 });
        camera.group.position({ x: 0, y: 0 });

        stage.draw();

        const bounds = this._group.getClientRect();

        const canvas = stage.toCanvas({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            pixelRatio: 1,
        });

        camera.group.scale(oldScale);
        camera.group.position(oldPosition);

        uiLayer?.visible(uiLayerVisible);

        stage.draw();

        this._events.emit("layerRedraw");

        console.log("Image loaded.")

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Failed to create image blob."));
                    return;
                }

                resolve(blob);
            }, mimeType, quality);
        });

        return new Uint8Array(await blob.arrayBuffer());
    }

    resize(
        width: number,
        height: number,
    ): void {
        if (!this.image.outputImage) {
            return;
        }

        // Scale into work canvas.
        this.setWorkCanvasSize(width, height);
        this.workContext.drawImage(
            this.sourceCanvas,
            0,
            0,
            this.sourceCanvas.width,
            this.sourceCanvas.height,
            0,
            0,
            width,
            height,
        );

        // Replace the document image.
        this.replaceSourceCanvasFromWorkCanvas(width, height);

        this.image.setSize(width, height);
        this.setSize(width, height);
        this.setCrop({
            x: 0,
            y: 0,
            width: width,
            height: height
        });

        this.refresh();
    }

    crop(
        x: number = 0,
        y: number = 0,
        width: number,
        height: number,
    ): void {
        if (!this.image.outputImage) {
            return;
        }

        // Copy the selected region into the work canvas.
        this.setWorkCanvasSize(width, height);

        this.workContext.drawImage(
            this.sourceCanvas,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height,
        );

        this.replaceSourceCanvasFromWorkCanvas(width, height);

        this.image.setSize(width, height);
        this.setSize(width, height);
        this.setCrop({
            x: 0,
            y: 0,
            width,
            height,
        });

        this.refresh();
    }

    rotate90(clockwise: boolean = true) {
        if (!this.image.outputImage) return;

        /* 
        * clear workCanvas, translate origin to midpoint, rotate CW or CCW,
        * clear documentCanvas, copy workCanvas into documentCanvas,
        * replace outputImage with documentCanvas
        */
        this.setWorkCanvasSize(this._state.height, this._state.width);
        this.workContext.translate(
            this.workCanvas.width / 2,
            this.workCanvas.height / 2,
        );

        this.workContext.rotate(clockwise ? Math.PI / 2 : -Math.PI / 2);

        this.workContext.drawImage(
            this.sourceCanvas,
            -this.sourceCanvas.width / 2,
            -this.sourceCanvas.height / 2,
        );

        this.replaceSourceCanvasFromWorkCanvas(
            this.workCanvas.width,
            this.workCanvas.height
        );

        this.setSize(this._state.height, this._state.width);
        this.image.setSize(this.image.state.height, this.image.state.width);

        // set the new rotation state
        if (clockwise) {
            this._state.rotation += 90
        }
        else {
            this._state.rotation -= 90;
        }

        this.refresh({
            cameraCenter: false
        });
    }

    flip(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.image.outputImage) return;

        /* 
        * clear workCanvas, translate origin one width or height, 
        * scale to negative direction,
        * clear documentCanvas, copy workCanvas into documentCanvas,
        * replace outputImage with documentCanvas
        */
        this.setWorkCanvasSize(this.sourceCanvas.width, this.sourceCanvas.height);
        this.workContext.translate(
            horizontal ? this.workCanvas.width : 0,
            vertical ? this.workCanvas.height : 0,
        );

        this.workContext.scale(
            horizontal ? -1 : 1,
            vertical ? -1 : 1,
        );

        this.workContext.drawImage(
            this.sourceCanvas,
            0,
            0,
        );

        this.replaceSourceCanvasFromWorkCanvas(
            this.workCanvas.width,
            this.workCanvas.height
        );

        if (horizontal) {
            this._state.flip.horizontal =
                !this._state.flip.horizontal;
        }

        if (vertical) {
            this._state.flip.vertical =
                !this._state.flip.vertical;
        }

        this._events.emit("documentState", { state: this._state });

        this.refresh({
            cameraCenter: false
        });
    }

    // Labeling

    hasLabelImage(): boolean {
        return this.labelImage.created;
    }

    createLabel(): void {

        this.labelImage.create(
            this.state.width,
            this.state.height,
        );

        if (!this.group.children.includes(this.labelImage.outputImage)) {
            this.group.add(this.labelImage.outputImage);
        }

        this.events.emit("layerRedraw");

        this.events.emit("labelImageCreate", {
            created: true,
        });
    }

    hasImage(): boolean {
        return this.state.width > 0 && this.state.height > 0;
    }
}