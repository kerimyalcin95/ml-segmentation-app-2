import Konva from 'konva';
import { Camera } from "./camera";
import { Document } from './document';
import { CONTEXT, contextContainer } from './container';

export class CanvasManager {
    private stage: Konva.Stage;
    private layer: Konva.Layer;

    private readonly _camera: Camera;
    private readonly _document: Document;

    get camera(): Camera {
        return this._camera;
    }

    get document(): Document {
        return this._document
    }

    constructor(container: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container,
            width: container.clientWidth,
            height: container.clientHeight,
        });

        this.layer = new Konva.Layer();

        this._document = new Document();

        this._camera = new Camera(
            this.stage,
            this.layer,
            this.document.workspace
        )

        this._camera.group.add(this._document.group);

        this.layer.add(
            this.camera.group
        );

        this.stage.add(
            this.layer
        );

        this.document.events.on("cameraRefresh", () => {
            this.camera.refresh();
        });

        this.document.events.on("layerRedraw", () => {
            this.layer.batchDraw();
        });

        this.document.events.on("cameraCenter", () => {
            this.camera.center();
        })

        contextContainer.register(CONTEXT.MainStage, this.stage);
        contextContainer.register(CONTEXT.Camera, this._camera);
        contextContainer.register(CONTEXT.Document, this._document);

        this.document.__camera = this._camera; // DEBUG
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