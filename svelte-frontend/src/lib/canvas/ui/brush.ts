import Konva from "konva";

export class Brush {

    private readonly cursor: Konva.Circle;

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
    ) {
        this.cursor = new Konva.Circle({
            radius: this._size / 2,
            stroke: "white",
            strokeWidth: 1,
            fillEnabled: false,
            listening: false,
            visible: false,
        });

        this.registerEvents();
    }

    private registerEvents(): void {
        this.stage.on("pointermove", this.onPointerMove);
        this.stage.on("pointerenter", this.onPointerEnter);
        this.stage.on("pointerleave", this.onPointerLeave);
        this.stage.on("pointerdown", this.onPointerDown);
        this.stage.on("pointerup", this.onPointerUp);
        this.stage.on("pointercancel", this.onPointerUp);
    }

    private onPointerMove = (): void => {
        const pointer = this.stage.getPointerPosition();

        if (!pointer) {
            return;
        }

        this.cursor.position(pointer);
        this.layer.batchDraw();
    };

    private onPointerEnter = (): void => { };
    private onPointerLeave = (): void => { };
    private onPointerDown = (): void => { };
    private onPointerUp = (): void => { };

    public destroy(): void {
        this.stage.off("pointermove", this.onPointerMove);
        this.stage.off("pointerenter", this.onPointerEnter);
        this.stage.off("pointerleave", this.onPointerLeave);
        this.stage.off("pointerdown", this.onPointerDown);
        this.stage.off("pointerup", this.onPointerUp);
        this.stage.off("pointercancel", this.onPointerUp);
    }

    setSize(size: number): void {

        this._size = Math.max(1, Math.round(size));

        this.cursor.radius(this._size / 2);
    }

    show(): void {
        this.cursor.visible(true);
    }

    hide(): void {
        this.cursor.visible(false);
    }

    setEnabled(enabled: boolean): void {
        this.cursor.visible(enabled);
    }
}