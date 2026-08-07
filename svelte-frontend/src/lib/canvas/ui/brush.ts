import Konva from "konva";
import { Camera } from "../camera";

export class Brush {

    private readonly cursor: Konva.Circle;

    private enabled = false;

    private _size = 32;

    get size(): number {
        return this._size;
    }

    get node(): Konva.Circle {
        return this.cursor;
    }

    constructor(
        private stage: Konva.Stage,
        private layer: Konva.Layer,
        private camera: Camera,
    ) {
        this.cursor = new Konva.Circle({
            radius: this._size / 2,
            stroke: "white",
            strokeWidth: 1,
            fillEnabled: false,
            listening: false,
            visible: false,
        });

        this.camera.events.on("cameraState", this.onCameraState);

        this.registerEvents();
    }

    private onCameraState = (): void => {
        this.updateCursor();
    };

    private updateCursor(): void {
        this.cursor.radius((this._size * this.camera.state.zoom) / 2);
        this.layer.batchDraw();
    }

    private registerEvents(): void {
        this.stage.on("pointermove", this.onPointerMove);
        this.stage.on("mouseenter", this.onMouseEnter);
        this.stage.on("mouseleave", this.onMouseLeave);
        this.stage.on("pointerdown", this.onPointerDown);
        this.stage.on("pointerup", this.onPointerUp);
        this.stage.on("pointercancel", this.onPointerUp);
    }

    private onPointerMove = (): void => {
        if (!this.enabled) {
            return;
        }

        const pointer = this.stage.getPointerPosition();

        if (!pointer) {
            this.hide();
            this.layer.batchDraw();
            return;
        }

        this.show();
        this.cursor.position(pointer);
        this.layer.batchDraw();
    };

    private onMouseEnter = (): void => {
        if (!this.enabled) {
            return;
        }

        console.log("pointerenter", this.enabled);

        this.stage.container().style.cursor = "none";
        this.show();
        this.layer.batchDraw();
    };

    private onMouseLeave = (): void => {
        this.stage.container().style.cursor = "default";
        this.hide();
        this.layer.batchDraw();
    };

    private onPointerDown = (): void => { };
    private onPointerUp = (): void => { };

    public destroy(): void {
        this.stage.off("pointermove", this.onPointerMove);
        this.stage.off("pointerenter", this.onMouseEnter);
        this.stage.off("pointerleave", this.onMouseLeave);
        this.stage.off("pointerdown", this.onPointerDown);
        this.stage.off("pointerup", this.onPointerUp);
        this.stage.off("pointercancel", this.onPointerUp);

        this.camera.events.off("cameraState", this.onCameraState);
    }

    setSize(size: number): void {
        this._size = Math.max(1, Math.round(size));
        this.updateCursor();
    }

    show(): void {
        this.cursor.visible(true);
    }

    hide(): void {
        this.cursor.visible(false);
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;

        if (!enabled) {
            this.stage.container().style.cursor = "default";
            this.hide();
        }

        this.layer.batchDraw();
    }
}