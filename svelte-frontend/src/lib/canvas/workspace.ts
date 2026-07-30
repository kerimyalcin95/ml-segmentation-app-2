export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Workspace {
    private bounds: Bounds = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    private _margin = 500;

    get margin() {
        return this._margin;
    }

    left = 0;
    top = 0;
    right = 0;
    bottom = 0;

    setMargin(margin: number): void {
        this._margin = margin;
        this.update();
    }

    setBounds(bounds: Bounds): void {
        this.bounds = { ...bounds };
        this.update();
    }

    private update(): void {
        this.left = this.bounds.x - this._margin;
        this.top = this.bounds.y - this._margin;
        this.right = this.bounds.x + this.bounds.width + this._margin;
        this.bottom = this.bounds.y + this.bounds.height + this._margin;
    }

    get width(): number {
        return this.right - this.left;
    }

    get height(): number {
        return this.bottom - this.top;
    }
}