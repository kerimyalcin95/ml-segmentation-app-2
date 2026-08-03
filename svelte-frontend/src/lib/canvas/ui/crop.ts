import Konva from "konva";

import { Camera } from "../camera";
import { Document } from "../document";

export class CropOverlay {
    readonly group = new Konva.Group({
        visible: false,
        listening: false,
    });

    private readonly rect: Konva.Rect;

    private readonly gridLines: Konva.Line[] = [];

    private readonly handles: Konva.Circle[] = [];

    constructor(
        private readonly camera: Camera,
        private readonly document: Document,
    ) {
        const primary = getComputedStyle(globalThis.document.documentElement)
            .getPropertyValue("--primary")
            .trim();

        this.rect = new Konva.Rect({
            stroke: primary,
            strokeWidth: 1,
            fillEnabled: false,
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
            const handle = new Konva.Circle({
                radius: 5,
                fill: "white",
                stroke: primary,
                strokeWidth: 1,
                opacity: 1
            });

            this.handles.push(handle);
            this.group.add(handle);
        }
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
    }
}