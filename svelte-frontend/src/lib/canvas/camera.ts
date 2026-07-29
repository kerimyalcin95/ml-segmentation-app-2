import Konva from "konva";

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

    get state(): CameraState {
        return this._state;
    }

    set(state: CameraState): void {
        this._state = { ...state };

        this.refresh();
    }

    private callback?: (
        camera: CameraState
    ) => void;

    constructor(
        private stage: Konva.Stage,
        private layer: Konva.Layer,
        private cameraGroup: Konva.Group,
        private documentGroup: Konva.Group
    ) { }

    private clamp(): void {

        const rect =
            this.documentGroup.getClientRect({
                relativeTo: this.cameraGroup,
            });

        const contentWidth =
            rect.width * this.state.zoom;

        const contentHeight =
            rect.height * this.state.zoom;

        const offsetX =
            Math.min(0, rect.x * this.state.zoom);

        const offsetY =
            Math.min(0, rect.y * this.state.zoom);

        const maxX =
            Math.max(
                0,
                contentWidth + offsetX - this.stage.width()
            );

        const maxY =
            Math.max(
                0,
                contentHeight + offsetY - this.stage.height()
            );

        this.state.x =
            Math.max(
                0,
                Math.min(
                    this.state.x,
                    maxX
                )
            );

        this.state.y =
            Math.max(
                0,
                Math.min(
                    this.state.y,
                    maxY
                )
            );
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
        this.cameraGroup.scale({
            x: this.state.zoom,
            y: this.state.zoom,
        });

        this.cameraGroup.position({
            x: -this.state.x,
            y: -this.state.y,
        });

        this.layer.batchDraw();
    }

    private notify(): void {
        this.callback?.(this.state);
    }

    refresh(): void {
        this.clamp();
        this.apply();
        this.notify();
    }

    onChange(
        callback: (camera: CameraState) => void
    ): void {
        this.callback = callback;
    }
}
