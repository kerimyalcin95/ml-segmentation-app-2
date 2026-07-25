import Konva from 'konva';


interface Camera {
    x: number;
    y: number;
    zoom: number;
}


export class CanvasManager {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private imageGroup: Konva.Group;
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

        this.imageGroup = new Konva.Group();

        this.layer.add(this.imageGroup);

        this.stage.add(this.layer);
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


            this.imageGroup.destroyChildren();


            this.imageNode = new Konva.Image({
                image,
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
                listening: false,
            });


            this.imageGroup.add(
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
        const oldScale = this.imageGroup.scale();
        const oldPosition = this.imageGroup.position();

        this.imageGroup.scale({
            x: 1,
            y: 1,
        });

        this.imageGroup.position({
            x: 0,
            y: 0,
        });


        const data = this.stage.toDataURL({
            x: 0,
            y: 0,
            width: this.documentSize.width,
            height: this.documentSize.height,
            mimeType: 'image/png',
            pixelRatio: 1,
        });


        this.imageGroup.scale(oldScale);
        this.imageGroup.position(oldPosition);

        this.layer.batchDraw();

        return data;
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
        const contentWidth =
            this.documentSize.width * this.camera.zoom;

        const contentHeight =
            this.documentSize.height * this.camera.zoom;


        const maxX = Math.max(
            0,
            contentWidth - this.stage.width()
        );

        const maxY = Math.max(
            0,
            contentHeight - this.stage.height()
        );


        this.camera.x = Math.max(
            0,
            Math.min(this.camera.x, maxX)
        );

        this.camera.y = Math.max(
            0,
            Math.min(this.camera.y, maxY)
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
        this.imageGroup.scale({
            x: this.camera.zoom,
            y: this.camera.zoom,
        });


        this.imageGroup.position({
            x: -this.camera.x,
            y: -this.camera.y,
        });


        this.layer.batchDraw();
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
        if (!this.imageNode) return;


        const normalized =
            ((angle % 360) + 360) % 360;


        const oldWidth =
            this.imageNode.width();

        const oldHeight =
            this.imageNode.height();


        if (
            normalized === 90 ||
            normalized === 270
        ) {
            this.imageNode.width(oldHeight);
            this.imageNode.height(oldWidth);

            this.documentSize.width = oldHeight;
            this.documentSize.height = oldWidth;
        }


        this.imageNode.rotation(normalized);


        this.documentResizeCallback?.(
            this.documentSize.width,
            this.documentSize.height
        );


        this.clampCamera();

        this.applyCamera();

        this.layer.batchDraw();
    }


    flip(
        horizontal: boolean,
        vertical: boolean,
    ) {
        if (!this.imageNode) return;


        this.imageNode.scale({
            x: horizontal ? -1 : 1,
            y: vertical ? -1 : 1,
        });


        this.imageNode.offset({
            x: horizontal
                ? this.imageNode.width()
                : 0,

            y: vertical
                ? this.imageNode.height()
                : 0,
        });


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