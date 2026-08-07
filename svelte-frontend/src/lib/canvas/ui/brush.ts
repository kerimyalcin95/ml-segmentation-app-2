import Konva from "konva";

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
        private container: HTMLDivElement,
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

    private onPointerEnter = (): void => {
        if (!this.enabled) {
            return;
        }

        this.container.style.cursor = "none";
        this.show();
        this.layer.batchDraw();
    };

    private onPointerLeave = (): void => {
        this.container.style.cursor = "";
        this.hide();
        this.layer.batchDraw();
    };

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
        this.enabled = enabled;

        if (enabled) {
            this.show();
        } else {
            this.container.style.cursor = "";
            this.hide();
        }

        this.layer.batchDraw();
    }
}