import Konva from "konva";

import { Camera } from "../camera";
import { Document } from "../document";

import { sessionStore } from "$lib/components/stores/sessionStore.svelte";

export class Brush {

    private readonly cursor: Konva.Circle;

    private enabled = false;
    private drawing = false;

    private resizing = false;

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

    private getCanvas(): HTMLCanvasElement | null {
        return this.stage
            .container()
            .querySelector("canvas");
    }

    private onPointerLockChange = (): void => {

        const canvas = this.getCanvas();

        if (!canvas) {
            return;
        }

        const locked = document.pointerLockElement === canvas;

        this.resizing = locked;

        if (!locked) {
            this.drawing = false;
            this.show();
            this.layer.batchDraw();
        }
    };

    private onCameraState = (): void => {
        this.updateCursor();
    };

    private updateCursor(): void {
        this.cursor.radius((this._size * this.camera.state.zoom) / 2);
        this.layer.batchDraw();
    }

    private paint(erase: boolean): void {

        const point = this.camera.getDocumentPointer();

        if (!point) {
            return;
        }

        if (erase) {
            this.document.labelImage.eraseCircle(
                point.x,
                point.y,
                this.size / 2,
            );
        } else {
            const labelIndex =
                sessionStore.labeling.activeLabels.findIndex(
                    (label) => label.selected,
                );

            if (labelIndex === -1) {
                return;
            }

            this.document.labelImage.drawCircle(
                point.x,
                point.y,
                this.size / 2,
                labelIndex,
            );
        }

        this.layer.batchDraw();
    }

    private registerEvents(): void {
        document.addEventListener(
            "pointerlockchange",
            this.onPointerLockChange,
        );

        this.stage.on("pointermove", this.onPointerMove);
        this.stage.on("mouseenter", this.onMouseEnter);
        this.stage.on("mouseleave", this.onMouseLeave);
        this.stage.on("pointerdown", this.onPointerDown);
        this.stage.on("pointerup", this.onPointerUp);
        this.stage.on("pointercancel", this.onPointerUp);
    }

    private onPointerMove = (event: Konva.KonvaEventObject<PointerEvent>): void => {
        if (!this.enabled) {
            return;
        }

        if (this.resizing) {

            this.show();

            const delta = -event.evt.movementY;

            if (delta !== 0) {
                sessionStore.labeling.brushSize += delta;
                this.setSize(sessionStore.labeling.brushSize);
            }

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
            this.paint(event.evt.altKey);
        }

        this.layer.batchDraw();
    };

    private onMouseEnter = (): void => {
        if (!this.enabled) {
            return;
        }

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

        if (event.evt.ctrlKey && event.evt.altKey) {

            this.drawing = false;
            this.resizing = true;

            const canvas = this.getCanvas();

            if (!canvas) {
                return;
            }

            void canvas.requestPointerLock();

            return;
        }

        this.drawing = true;
        this.paint(event.evt.altKey);
    };

    private onPointerUp = (): void => {

        if (this.resizing) {
            document.exitPointerLock();
        }

        this.resizing = false;
        this.drawing = false;
    }

    public destroy(): void {
        this.stage.off("pointermove", this.onPointerMove);
        this.stage.off("pointerenter", this.onMouseEnter);
        this.stage.off("pointerleave", this.onMouseLeave);
        this.stage.off("pointerdown", this.onPointerDown);
        this.stage.off("pointerup", this.onPointerUp);
        this.stage.off("pointercancel", this.onPointerUp);

        this.camera.events.off("cameraState", this.onCameraState);

        document.removeEventListener(
            "pointerlockchange",
            this.onPointerLockChange,
        );
    }

    setSize(size: number): void {
        this._size = Math.min(
            512,
            Math.max(1, Math.round(size)),
        );
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