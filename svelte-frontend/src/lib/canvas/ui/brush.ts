import Konva from "konva";

import { Camera } from "../camera";
import { Document } from "../document";

import { sessionStore } from "$lib/components/stores/sessionStore.svelte";

export class Brush {

    private readonly cursor: Konva.Circle;

    private enabled = false;
    private drawing = false;

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
        private document: Document,
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

    private paint(): void {

        const point = this.camera.getDocumentPointer();

        if (!point) {
            return;
        }

        const label = sessionStore.activeLabels.find(
            (label) => label.selected,
        );

        if (!label) {
            return;
        }

        this.document.labelImage.drawCircle(
            point.x,
            point.y,
            this.size / 2,
            label.color,
        );

        const pointer = this.stage.getPointerPosition();
        console.log("stage", pointer);

        const documentPoint = this.camera.getDocumentPointer();
        console.log("camera", documentPoint);

        console.log("document group", this.document.group.position());
        console.log("document offset", this.document.group.offset());

        console.log("image", this.document.image.outputImage?.position());
        console.log("image offset", this.document.image.outputImage?.offset());

        console.log("label", this.document.labelImage.outputImage.position());
        console.log("label offset", this.document.labelImage.outputImage.offset());

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

        if (this.drawing) {
            this.paint();
        }

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

    private onPointerDown = (event: Konva.KonvaEventObject<PointerEvent>): void => {

        if (!this.enabled) {
            return;
        }

        if (event.evt.button !== 0) {
            return;
        }

        this.drawing = true;

        this.paint();
    };

    private onPointerUp = (): void => {
        this.drawing = false;
    };

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