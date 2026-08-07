import Konva from "konva";
import mitt from "mitt";
import { type CanvasEvents } from "./events";

import { Workspace } from "./workspace";

export interface CameraState {
    x: number;
    y: number;
    zoom: number;
}

export class Camera {

    private _state: CameraState = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    private _group: Konva.Group;

    readonly events = mitt<CanvasEvents>();

    get state(): CameraState {
        return this._state;
    }

    set(state: CameraState): void {
        this._state = { ...state };

        this.refresh();
    }

    get group(): Konva.Group {
        return this._group;
    }

    constructor(
        private stage: Konva.Stage,
        private layer: Konva.Layer,
        private workspace: Workspace,
    ) {
        this._group = new Konva.Group();
    }

    private clamp(): void {
        const viewportWidth = this.stage.width();
        const viewportHeight = this.stage.height();

        const maxX = Math.max(
            0,
            this.workspace.width * this.state.zoom - viewportWidth,
        );

        const maxY = Math.max(
            0,
            this.workspace.height * this.state.zoom - viewportHeight,
        );

        this.state.x = Math.max(
            0,
            Math.min(this.state.x, maxX),
        );

        this.state.y = Math.max(
            0,
            Math.min(this.state.y, maxY),
        );
    }

    public getDocumentPointer(): { x: number; y: number } | null {
        const pointer = this.stage.getPointerPosition();

        if (!pointer) {
            return null;
        }

        return {
            x:
                (pointer.x + this.state.x) / this.state.zoom
                + this.workspace.left,
            y:
                (pointer.y + this.state.y) / this.state.zoom
                + this.workspace.top,
        };
    }

    center(): void {
        const viewportWidth =
            this.stage.width() / this.state.zoom;

        const viewportHeight =
            this.stage.height() / this.state.zoom;

        this.state.x =
            (this.workspace.width - viewportWidth) / 2;

        this.state.y =
            (this.workspace.height - viewportHeight) / 2;

        this.refresh();
    }

    setZoom(
        zoom: number,
        centerX: number,
        centerY: number,
    ): void {
        const oldZoom = this.state.zoom;

        const worldX =
            (centerX + this.state.x) / oldZoom;

        const worldY =
            (centerY + this.state.y) / oldZoom;

        this.state.zoom = zoom;

        this.state.x =
            worldX * zoom - centerX;

        this.state.y =
            worldY * zoom - centerY;

        this.refresh();
    }

    private apply(): void {
        this._group.scale({
            x: this.state.zoom,
            y: this.state.zoom,
        });

        this._group.position({
            x: -this.state.x,
            y: -this.state.y,
        });

        this.layer.batchDraw();
    }

    private notify(): void {
        this.events.emit("cameraState", { state: this._state });
    }

    refresh(): void {
        this.clamp();
        this.apply();
        this.notify();
    }
}
