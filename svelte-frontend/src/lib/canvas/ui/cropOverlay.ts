import Konva from "konva";

import { Camera } from "../camera";
import { Document } from "../document";

type CropDragMode =
    | "move"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft";

export interface CropOverlayState {
    dragging: boolean;
    dragMode: CropDragMode;

    dragStart: {
        x: number;
        y: number;
    };

    cropStart: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}



export class CropOverlay {
    readonly group = new Konva.Group({
        visible: false,
        listening: true,
    });

    private readonly rect: Konva.Rect;
    private readonly gridLines: Konva.Line[] = [];
    private readonly handles: Konva.Rect[] = [];

    private _state: CropOverlayState = {
        dragging: false,
        dragStart: {
            x: 0,
            y: 0
        },
        cropStart: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        dragMode: "move"
    }

    get state(): CropOverlayState {
        return this._state;
    }

    constructor(
        private readonly stage: Konva.Stage,
        private readonly camera: Camera,
        private readonly document: Document,
    ) {
        const primary = getComputedStyle(globalThis.document.documentElement)
            .getPropertyValue("--primary")
            .trim();

        const primaryTransparent = primary.replace(")", " / 0.1)");
        const handleSize = 10;

        const dragModes: CropDragMode[] = [
            "topLeft",
            "top",
            "topRight",
            "right",
            "bottomRight",
            "bottom",
            "bottomLeft",
            "left",
        ];

        const cursors = [
            "nwse-resize",
            "ns-resize",
            "nesw-resize",
            "ew-resize",
            "nwse-resize",
            "ns-resize",
            "nesw-resize",
            "ew-resize",
        ];

        this.rect = new Konva.Rect({
            stroke: primary,
            strokeWidth: 1,
            fill: primaryTransparent
        });

        this.rect.listening(true);
        this.rect.draggable(false);

        this.rect.on("pointerdown", () => {
            const pointer = this.getDocumentPointer();

            if (!pointer) {
                return;
            }

            this.state.dragging = true;
            this.state.dragMode = "move";

            this.state.dragStart = pointer;

            this.state.cropStart = {
                ...this.document.state.crop,
            };
        });

        this.rect.on("mouseenter", () => {
            this.stage.container().style.cursor = "move";
        });

        this.rect.on("mouseleave", () => {
            if (!this.state.dragging) {
                this.stage.container().style.cursor = "default";
            }
        });

        this.group.add(this.rect);

        // Rule-of-thirds grid
        for (let i = 0; i < 4; i++) {
            const line = new Konva.Line({
                stroke: "#e5e7eb",
                strokeWidth: 1,
                opacity: 0.5,
            });

            this.gridLines.push(line);
            this.group.add(line);
        }

        // 8 resize handles
        for (let i = 0; i < 8; i++) {
            const handle = new Konva.Rect({
                width: handleSize,
                height: handleSize,
                offsetX: handleSize / 2,
                offsetY: handleSize / 2,
                fill: "white",
                opacity: 1
            });

            handle.listening(true);
            handle.hitStrokeWidth(16);

            handle.on("pointerdown", () => {
                const pointer = this.getDocumentPointer();

                if (!pointer) {
                    return;
                }

                this._state.dragging = true;
                this._state.dragMode = dragModes[i];

                this._state.dragStart = pointer;

                this._state.cropStart = {
                    ...this.document.state.crop,
                };
            });

            handle.on("mouseenter", () => {
                this.stage.container().style.cursor = cursors[i];
            });

            handle.on("mouseleave", () => {
                if (!this.state.dragging) {
                    this.stage.container().style.cursor = "default";
                }
            });

            this.handles.push(handle);
            this.group.add(handle);
        }

        this.rect.on("pointerdown", () => {
            const pointer = this.getDocumentPointer();

            if (!pointer) {
                return;
            }

            this._state.dragging = true;

            this._state.dragStart = pointer;

            this._state.cropStart = {
                ...this.document.state.crop,
            };
        });

        this.stage.on("pointerup", () => {
            this._state.dragging = false;
        });

        this.stage.on("pointermove", () => {
            if (!this._state.dragging) {
                return;
            }

            const pointer = this.getDocumentPointer();

            if (!pointer) {
                return;
            }

            const dx = pointer.x - this._state.dragStart.x;
            const dy = pointer.y - this._state.dragStart.y;

            const crop = {
                ...this._state.cropStart,
            };

            switch (this._state.dragMode) {

                case "move":
                    crop.x += dx;
                    crop.y += dy;
                    break;

                case "left":
                    crop.x += dx;
                    crop.width -= dx;
                    break;

                case "right":
                    crop.width += dx;
                    break;

                case "top":
                    crop.y += dy;
                    crop.height -= dy;
                    break;

                case "bottom":
                    crop.height += dy;
                    break;

                case "topLeft":
                    crop.x += dx;
                    crop.width -= dx;

                    crop.y += dy;
                    crop.height -= dy;
                    break;

                case "topRight":
                    crop.width += dx;

                    crop.y += dy;
                    crop.height -= dy;
                    break;

                case "bottomRight":
                    crop.width += dx;
                    crop.height += dy;
                    break;

                case "bottomLeft":
                    crop.x += dx;
                    crop.width -= dx;

                    crop.height += dy;
                    break;
            }

            this.document.setCrop(crop);

            this.clamp();

            this.refresh();
        });

        this.rect.moveToTop();
        this.handles.forEach((handle) => handle.moveToTop());
    }

    private clamp() {
        const crop = this.document.state.crop;

        crop.x = Math.max(
            0,
            Math.min(crop.x, this.document.state.width - crop.width),
        );

        crop.y = Math.max(
            0,
            Math.min(crop.y, this.document.state.height - crop.height),
        );
    }

    show(): void {
        this.group.visible(true);
        this.refresh();
    }

    hide(): void {
        this.group.visible(false);
    }

    refresh(): void {
        const crop = this.document.state.crop;
        const camera = this.camera.state;
        const image = this.document.image.outputImage;

        if (!image) return;

        const width = crop.width * camera.zoom;
        const height = crop.height * camera.zoom;

        const group = this.document.group.position();
        const offset = image.offset();

        const worldX = group.x - offset.x + crop.x;
        const worldY = group.y - offset.y + crop.y;

        const x = worldX * camera.zoom - camera.x;
        const y = worldY * camera.zoom - camera.y;

        this.rect.position({ x, y });
        this.rect.size({ width, height });

        // Vertical thirds
        this.gridLines[0].points([
            x + width / 3,
            y,
            x + width / 3,
            y + height,
        ]);

        this.gridLines[1].points([
            x + width * 2 / 3,
            y,
            x + width * 2 / 3,
            y + height,
        ]);

        // Horizontal thirds
        this.gridLines[2].points([
            x,
            y + height / 3,
            x + width,
            y + height / 3,
        ]);

        this.gridLines[3].points([
            x,
            y + height * 2 / 3,
            x + width,
            y + height * 2 / 3,
        ]);

        const points = [
            [x, y],
            [x + width / 2, y],
            [x + width, y],

            [x + width, y + height / 2],

            [x + width, y + height],

            [x + width / 2, y + height],

            [x, y + height],

            [x, y + height / 2],
        ];

        points.forEach(([px, py], index) => {
            this.handles[index].position({
                x: px,
                y: py,
            });
        });

        console.log("group", this.document.group.position());
        console.log("offset", image.offset());
        console.log("crop", this.document.state.crop);
    }

    resetState() {
        this._state = {
            dragging: false,
            dragStart: {
                x: 0,
                y: 0
            },
            cropStart: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            dragMode: "move"
        }
    }

    private getDocumentPointer() {
        const pointer = this.stage.getPointerPosition();

        if (!pointer) {
            return null;
        }

        const camera = this.camera.state;
        const image = this.document.image.outputImage;

        if (!image) {
            return null;
        }

        const group = this.document.group.position();
        const offset = image.offset();

        const worldX = (pointer.x + camera.x) / camera.zoom;
        const worldY = (pointer.y + camera.y) / camera.zoom;

        return {
            x: worldX - group.x + offset.x,
            y: worldY - group.y + offset.y,
        };
    }
}