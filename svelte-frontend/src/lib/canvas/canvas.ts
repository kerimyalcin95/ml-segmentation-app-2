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
            this.document.group,
            this.document.workspace
        )

        this.layer.add(
            this.camera.group
        );

        this.stage.add(
            this.layer
        );

        this.document.events.on("refreshCamera", () => {
            this.camera.refresh();
        });

        this.document.events.on("redrawLayer", () => {
            this.layer.batchDraw();
        });

        this.document.events.on("documentChange", () => {
            this.camera.center();

            console.log(this.camera.state);
            console.log(this.camera.group.position());
            console.log(this.stage.width(), this.stage.height());
        })

        this.camera.events.on("cameraChange", () => {
            console.log("camera.state",this.camera.state);
            console.log("camera.group.position",this.camera.group.position());
            console.log("document.group.position",this.document.group.position());
            console.log("canvas.state",this.stage.width(), this.stage.height());
        })

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