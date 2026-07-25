import Konva from 'konva';


interface Camera {
    x: number;
    y: number;
    zoom: number;
}


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

    private camera: Camera = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    private documentRotation = 0;

    private documentFlip = {
        horizontal: false,
        vertical: false,
    };


    private cameraCallback?: (
        x: number,
        y: number,
        zoom: number
    ) => void;


    private documentResizeCallback?: (
        width: number,
        height: number
    ) => void;


    private zoomCallback?: (
        zoom: number
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
    }


    resize(width: number, height: number) {
        this.stage.size({
            width,
            height,
        });

        this.clampCamera();

        this.applyCamera();

        this.cameraCallback?.(
            this.camera.x,
            this.camera.y,
            this.camera.zoom
        );

        this.layer.batchDraw();
    }

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


            this.applyCamera();

            this.layer.batchDraw();
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

    private getDocumentBounds() {

        const rect =
            this.documentGroup.getClientRect({
                relativeTo: this.cameraGroup,
            });


        return {
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

        this.documentGroup.position({
            x: this.documentSize.width / 2,
            y: this.documentSize.height / 2,
        });
    }


    setCamera(camera: Camera) {
        this.camera = camera;

        this.clampCamera();

        this.applyCamera();
    }

    getCamera() {
        return this.camera;
    }


    private clampCamera() {

        const rect =
            this.documentGroup.getClientRect({
                relativeTo: this.cameraGroup,
            });


        const contentWidth =
            rect.width * this.camera.zoom;


        const contentHeight =
            rect.height * this.camera.zoom;


        const maxX = Math.max(
            0,
            contentWidth - this.stage.width()
        );


        const maxY = Math.max(
            0,
            contentHeight - this.stage.height()
        );


        this.camera.x =
            Math.max(
                0,
                Math.min(
                    this.camera.x,
                    maxX
                )
            );


        this.camera.y =
            Math.max(
                0,
                Math.min(
                    this.camera.y,
                    maxY
                )
            );
    }


    setZoom(
        zoom: number,
        centerX: number,
        centerY: number,
    ) {
        const oldZoom = this.camera.zoom;

        const worldX =
            (centerX + this.camera.x) / oldZoom;

        const worldY =
            (centerY + this.camera.y) / oldZoom;


        this.camera.zoom = zoom;


        this.camera.x =
            worldX * zoom - centerX;

        this.camera.y =
            worldY * zoom - centerY;


        this.clampCamera();

        this.applyCamera();

        this.cameraCallback?.(
            this.camera.x,
            this.camera.y,
            this.camera.zoom
        );
    }


    private applyCamera() {
        this.cameraGroup.scale({
            x: this.camera.zoom,
            y: this.camera.zoom,
        });


        this.cameraGroup.position({
            x: -this.camera.x,
            y: -this.camera.y,
        });


        this.layer.batchDraw();
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

    onCameraChange(
        callback: (
            x: number,
            y: number,
            zoom: number
        ) => void
    ) {
        this.cameraCallback = callback;
    }

    resizeImage(
        width: number,
        height: number,
    ) {
        if (!this.imageNode) return;


        this.imageNode.width(width);
        this.imageNode.height(height);

        this.documentGroup.position({
            x: width / 2,
            y: height / 2,
        });

        this.documentSize.width = width;
        this.documentSize.height = height;

        this.documentResizeCallback?.(
            width,
            height
        );


        this.clampCamera();

        this.applyCamera();

        this.layer.batchDraw();
    }


    crop(
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

        this.documentGroup.position({
            x: width / 2,
            y: height / 2,
        });


        this.documentSize.width = width;
        this.documentSize.height = height;


        this.documentResizeCallback?.(
            width,
            height
        );


        this.clampCamera();

        this.applyCamera();

        this.layer.batchDraw();
    }


    rotate(angle: number) {

        this.documentRotation =
            (
                this.documentRotation + angle
            ) % 360;


        this.applyDocumentTransform();


        this.documentResizeCallback?.(
            this.getDocumentSize().width,
            this.getDocumentSize().height
        );


        this.clampCamera();


        this.cameraCallback?.(
            this.camera.x,
            this.camera.y,
            this.camera.zoom
        );


        this.layer.batchDraw();
    }


    flip(
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


        this.clampCamera();


        this.cameraCallback?.(
            this.camera.x,
            this.camera.y,
            this.camera.zoom
        );


        this.layer.batchDraw();
    }


    setGrayscale(enabled: boolean) {
        if (!this.imageNode) return;


        this.imageNode.filters(
            enabled
                ? [Konva.Filters.Grayscale]
                : []
        );


        this.imageNode.cache();

        this.layer.batchDraw();
    }


    destroy() {
        this.stage.destroy();
    }
}