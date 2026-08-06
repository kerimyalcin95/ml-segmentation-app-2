import Konva from 'konva';

export class LabelImage {

    private readonly canvas = document.createElement("canvas");
    private readonly context: CanvasRenderingContext2D;

    readonly outputImage: Konva.Image;

    constructor() {

        const context = this.canvas.getContext("2d");

        if (!context) {
            throw new Error("Failed to create 2D rendering context.");
        }

        this.context = context;

        this.outputImage = new Konva.Image({
            image: this.canvas,
            x: 0,
            y: 0,
            listening: false,
        });
    }

    setSize(
        width: number,
        height: number,
    ): void {

        this.canvas.width = width;
        this.canvas.height = height;

        this.outputImage.size({
            width,
            height,
        });

        this.outputImage.offset({
            x: width / 2,
            y: height / 2,
        });

        this.refresh();
    }

    clear(): void {

        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
        );

        this.refresh();
    }

    drawCircle(
        x: number,
        y: number,
        radius: number,
        color: string,
    ): void {

        this.context.fillStyle = color;

        this.context.beginPath();
        this.context.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2,
        );
        this.context.fill();

        this.refresh();
    }

    refresh(): void {
        this.outputImage.image(this.canvas);
    }
}