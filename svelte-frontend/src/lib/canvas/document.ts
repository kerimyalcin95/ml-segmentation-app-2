import Konva from 'konva';

import mitt from "mitt";
import type { CanvasEvents } from "./events";
import { CONTEXT, contextContainer } from "./container"
import { Camera } from "./camera";

export enum DocumentChange {
    Layer,
    Camera
}

export class Document {
    private readonly _group: Konva.Group;
    readonly events = mitt<CanvasEvents>();

    get group(): Konva.Group {
        return this._group;
    }

    private imageNode?: Konva.Image;

    private originalImage?: HTMLImageElement;
    private readonly renderCanvas = document.createElement("canvas");
    private readonly renderContext;

    private imageState = {
        width: 0,
        height: 0,

        crop: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },

        grayscale: false,
    };

    private documentSize = {
        width: 0,
        height: 0,
    };

    private documentRotation = 0;

    private documentFlip = {
        horizontal: false,
        vertical: false,
    };

    constructor() {
        this._group = new Konva.Group();

        const context = this.renderCanvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to create 2D rendering context.");
        }

        this.renderContext = context;
    }

    // Callbacks

    private changeCallback?: (change: DocumentChange) => void;

    private notifyChange(change: DocumentChange): void {
        this.changeCallback?.(change);
    }

    onChange(callback: (change: DocumentChange) => void): void {
        this.changeCallback = callback;
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

    getDocumentSize() {
        const bounds = this.getDocumentBounds();

        return {
            width: bounds.width,
            height: bounds.height,
        };
    }

    private updateDocumentTransformOrigin() {

        const rotated =
            Math.abs(this.documentRotation) % 180 === 90;

        const width =
            rotated
                ? this.imageState.height
                : this.imageState.width;

        const height =
            rotated
                ? this.imageState.width
                : this.imageState.height;

        this._group.position({
            x: width / 2,
            y: height / 2,
        });
    }

    private applyDocumentTransform() {

        this._group.rotation(
            this.documentRotation
        );

        this._group.scale({
            x: this.documentFlip.horizontal ? -1 : 1,
            y: this.documentFlip.vertical ? -1 : 1,
        });

        this.updateDocumentTransformOrigin();
    }

    // Image utility helpers

    private prepareRenderCanvas(): void {
        this.renderCanvas.width = this.imageState.width;
        this.renderCanvas.height = this.imageState.height;

        this.renderContext.clearRect(
            0,
            0,
            this.renderCanvas.width,
            this.renderCanvas.height,
        );
    }

    private updateImageNode(): void {
        if (!this.imageNode) {
            return;
        }

        this.imageNode.image(this.renderCanvas);

        this.imageNode.width(this.imageState.width);
        this.imageNode.height(this.imageState.height);

        this.imageNode.offsetX(this.imageState.width / 2);
        this.imageNode.offsetY(this.imageState.height / 2);
    }

    // Image editing

    private renderImage(): void {
        if (!this.originalImage) return;
        if (!this.imageNode) return;

        this.prepareRenderCanvas();

        this.drawImage();

        this.updateImageNode();

        this.applyImageFilters();

        this.events.emit("redrawLayer");
    }

    private drawImage(): void {
        if (!this.originalImage) {
            return;
        }

        const crop = this.imageState.crop;

        this.renderContext.drawImage(
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

    private applyImageFilters(): void {
        if (!this.imageNode) {
            return;
        }

        const filters = [];

        if (this.imageState.grayscale) {
            filters.push(Konva.Filters.Grayscale);
        }

        this.imageNode.filters(filters);
        this.imageNode.cache();
    }

    loadImage(path: string) {
        const image = new window.Image();

        image.onload = () => {
            this.originalImage = image;

            this.imageState.width = image.width;
            this.imageState.height = image.height;

            this.imageState.crop = {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            };

            this.documentSize.width = image.width;
            this.documentSize.height = image.height;

            this._group.destroyChildren();

            this.imageNode = new Konva.Image({
                image: this.renderCanvas,
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

            this.events.emit("documentResize", {
                width: image.width,
                height: image.height,
            });

            this.notifyChange(DocumentChange.Camera);
        };

        image.src = `file://${path}`;
    }

    saveImage() {

        const camera = contextContainer.resolve<Camera>(CONTEXT.Camera);
        const stage = contextContainer.resolve<Konva.Stage>(CONTEXT.MainStage);
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

        const data =
            stage.toDataURL({
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                mimeType: 'image/png',
                pixelRatio: 1,
            });

        camera.group.scale(oldScale);
        camera.group.position(oldPosition);

        this.events.emit("redrawLayer");

        return data;
    }

    resizeImage(width: number, height: number) {
        this.imageState.width = width;
        this.imageState.height = height;

        this.documentSize.width = width;
        this.documentSize.height = height;

        this.renderImage();

        this.applyDocumentTransform();

        const size = this.getDocumentSize();

        this.events.emit("documentResize", {
            width: size.width,
            height: size.height,
        });

        this.events.emit("refreshCamera");
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

        this.imageState.width = width;
        this.imageState.height = height;

        this.documentSize.width = width;
        this.documentSize.height = height;

        this.renderImage();

        this.applyDocumentTransform();

        this.events.emit("documentResize", {
            width: width,
            height: height,
        });

        this.events.emit("refreshCamera");
    }

    rotateImage(angle: number) {

        this.documentRotation =
            (
                this.documentRotation + angle
            ) % 360;

        this.applyDocumentTransform();

        this.events.emit("documentResize", {
            width: this.getDocumentSize().width,
            height: this.getDocumentSize().height
        });

        this.notifyChange(DocumentChange.Camera);
    }

    flipImage(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.imageNode) return;

        if (horizontal) {
            this.documentFlip.horizontal =
                !this.documentFlip.horizontal;
        }

        if (vertical) {
            this.documentFlip.vertical =
                !this.documentFlip.vertical;
        }

        this.applyDocumentTransform();
        this.imageNode.cache();
        this.events.emit("refreshCamera");
    }

    setFilterGrayscale(enabled: boolean) {
        this.imageState.grayscale = enabled;

        this.renderImage();
    }
}