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

    constructor() {

        this.cursor = new Konva.Circle({
            radius: this._size / 2,
            stroke: "white",
            strokeWidth: 1,
            fillEnabled: false,
            listening: false,
            visible: false,
        });
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