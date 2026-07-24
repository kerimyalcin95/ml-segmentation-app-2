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

        this.applyCamera();
    }


    setZoom(zoom: number) {
        this.camera.zoom = zoom;

        this.applyCamera();

        this.zoomCallback?.(zoom);
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


    onZoomChange(
        callback: (zoom: number) => void
    ) {
        this.zoomCallback = callback;
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