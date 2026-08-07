import Konva from 'konva';
import { Camera } from "./camera";
import { Document } from './document';
import { CONTEXT, contextContainer } from './container';
import { CropOverlay } from "./ui/cropOverlay";
import { Brush } from "./ui/brush";

export class CanvasManager {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private uiLayer: Konva.Layer;

    private readonly _camera: Camera;

    get camera(): Camera {
        return this._camera;
    }

    private readonly _document: Document;

    get document(): Document {
        return this._document
    }

    private readonly _cropOverlay: CropOverlay;

    get cropOverlay(): CropOverlay {
        return this._cropOverlay;
    }

    private readonly _brush: Brush;

    get brush(): Brush {
        return this._brush;
    }

    constructor(container: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container,
            width: container.clientWidth,
            height: container.clientHeight,
        });

        this.layer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();

        this._document = new Document();

        this._camera = new Camera(
            this.stage,
            this.layer,
            this.document.workspace
        )

        this._cropOverlay = new CropOverlay(
            this.stage,
            this._camera,
            this._document,
        );

        this._brush = new Brush();

        this._camera.group.add(this._document.group);

        this.layer.add(this.camera.group);
        this.uiLayer.add(this.cropOverlay.group);

        this.stage.add(this.layer);

        this.stage.add(this.uiLayer);
        this.uiLayer.add(this.brush.node);

        this.document.events.on("cameraRefresh", () => {
            this.camera.refresh();
        });

        this.document.events.on("layerRedraw", () => {
            this.layer.batchDraw();
        });

        this.document.events.on("cameraCenter", () => {
            this.camera.center();
        })

        this.document.events.on("documentState", () => {
            this.cropOverlay.refresh();
            this.cropOverlay.resetState();
            this.document.setCrop({
                x: 0,
                y: 0,
                width: this.document.state.width,
                height: this.document.state.height
            });
            this.uiLayer.batchDraw();
        });

        this.document.events.on("documentResize", () => {
            this.cropOverlay.refresh();
            this.cropOverlay.resetState();
            this.uiLayer.batchDraw();
        });

        this.camera.events.on("cameraState", () => {
            this.cropOverlay.refresh();
            this.uiLayer.batchDraw();
        });

        contextContainer.register(CONTEXT.MainStage, this.stage);
        contextContainer.register(CONTEXT.Camera, this._camera);
        contextContainer.register(CONTEXT.Document, this._document);
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
}