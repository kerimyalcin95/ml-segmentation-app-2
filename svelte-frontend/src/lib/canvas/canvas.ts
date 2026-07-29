import Konva from 'konva';
import { Camera } from "./camera";

export class CanvasManager {
    private stage: Konva.Stage;
    private layer: Konva.Layer;

    private cameraGroup: Konva.Group;
    private documentGroup: Konva.Group;
    private segmentationGroup: Konva.Group;

    private imageNode?: Konva.Image;

    private documentSize = {
        width: 0,
        height: 0,
    };

    private readonly _camera: Camera;

    get camera(): Camera {
        return this._camera;
    }

    private documentRotation = 0;

    private documentFlip = {
        horizontal: false,
        vertical: false,
    };

    private documentResizeCallback?: (
        width: number,
        height: number
    ) => void;

    constructor(container: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container,
            width: container.clientWidth,
            height: container.clientHeight,
        });

        this.layer = new Konva.Layer();

        this.cameraGroup = new Konva.Group();

        this.documentGroup = new Konva.Group();

        this.segmentationGroup = new Konva.Group();

        this.documentGroup.add(
            this.segmentationGroup
        );

        this.cameraGroup.add(
            this.documentGroup
        );

        this.layer.add(
            this.cameraGroup
        );

        this.stage.add(
            this.layer
        );

        this._camera = new Camera(
            this.stage,
            this.layer,
            this.cameraGroup,
            this.documentGroup
        );
    }

    // Canvas, Stage

    resize(width: number, height: number) {
        this.stage.size({
            width,
            height,
        });

        this.camera.refresh();
    }

    destroy() {
        this.stage.destroy();
    }

    // Document

    private getDocumentBounds() {
        const rect =
            this.documentGroup.getClientRect({
                relativeTo: this.cameraGroup,
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
                ? this.imageNode?.height() ?? this.documentSize.width
                : this.imageNode?.width() ?? this.documentSize.width;

        const height =
            rotated
                ? this.imageNode?.width() ?? this.documentSize.height
                : this.imageNode?.height() ?? this.documentSize.height;

        this.documentGroup.position({
            x: width / 2,
            y: height / 2,
        });
    }

    private applyDocumentTransform() {

        this.documentGroup.rotation(
            this.documentRotation
        );

        this.documentGroup.scale({
            x: this.documentFlip.horizontal ? -1 : 1,
            y: this.documentFlip.vertical ? -1 : 1,
        });

        this.updateDocumentTransformOrigin();
    }

    onDocumentResize(
        callback: (width: number, height: number) => void
    ) {
        this.documentResizeCallback = callback;
    }

    // Image editing

    loadImage(path: string) {
        const image = new Image();

        image.onload = () => {
            this.documentSize.width = image.width;
            this.documentSize.height = image.height;

            this.documentGroup.destroyChildren();

            this.imageNode = new Konva.Image({
                image,
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
                offsetX: image.width / 2,
                offsetY: image.height / 2,
                listening: false,
            });

            this.documentGroup.position({
                x: image.width / 2,
                y: image.height / 2,
            });

            this.documentGroup.add(
                this.imageNode
            );

            this.documentResizeCallback?.(
                image.width,
                image.height
            );

            this.camera.refresh();
        };

        image.src = `file://${path}`;
    }

    saveImage() {
        const oldScale = this.cameraGroup.scale();
        const oldPosition = this.cameraGroup.position();

        this.cameraGroup.scale({
            x: 1,
            y: 1,
        });

        this.cameraGroup.position({
            x: 0,
            y: 0,
        });

        const bounds =
            this.documentGroup.getClientRect();

        const data =
            this.stage.toDataURL({
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                mimeType: 'image/png',
                pixelRatio: 1,
            });

        this.cameraGroup.scale(oldScale);
        this.cameraGroup.position(oldPosition);

        this.layer.batchDraw();

        return data;
    }

    resizeImage(
        width: number,
        height: number,
    ) {
        if (!this.imageNode) return;

        this.imageNode.width(width);
        this.imageNode.height(height);

        this.imageNode.offsetX(width / 2);
        this.imageNode.offsetY(height / 2);

        this.documentSize.width = width;
        this.documentSize.height = height;

        this.applyDocumentTransform();

        this.documentResizeCallback?.(
            this.getDocumentSize().width,
            this.getDocumentSize().height
        );

        this.camera.refresh();
    }

    cropImage(
        x: number,
        y: number,
        width: number,
        height: number,
    ) {
        if (!this.imageNode) return;

        const oldImage = this.imageNode.image();

        if (!oldImage) return;

        this.imageNode.crop({
            x,
            y,
            width,
            height,
        });

        this.imageNode.width(width);
        this.imageNode.height(height);

        this.imageNode.offsetX(width / 2);
        this.imageNode.offsetY(height / 2);

        this.applyDocumentTransform();

        this.documentSize.width = width;
        this.documentSize.height = height;

        this.documentResizeCallback?.(
            width,
            height
        );

        this.camera.refresh();
    }

    rotateImage(angle: number) {

        this.documentRotation =
            (
                this.documentRotation + angle
            ) % 360;

        this.applyDocumentTransform();

        this.documentResizeCallback?.(
            this.getDocumentSize().width,
            this.getDocumentSize().height
        );

        this.camera.refresh();
    }

    flipImage(
        horizontal: boolean,
        vertical: boolean,
    ) {

        if (horizontal) {
            this.documentFlip.horizontal =
                !this.documentFlip.horizontal;
        }

        if (vertical) {
            this.documentFlip.vertical =
                !this.documentFlip.vertical;
        }

        this.applyDocumentTransform();
        this.camera.refresh();
    }

    setImageFilterGrayscale(enabled: boolean) {
        if (!this.imageNode) return;

        this.imageNode.filters(
            enabled
                ? [Konva.Filters.Grayscale]
                : []
        );

        this.imageNode.cache();

        this.layer.batchDraw();
    }
}