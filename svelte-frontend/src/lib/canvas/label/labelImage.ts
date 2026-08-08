import Konva from 'konva';

import { CONTEXT, contextContainer } from '../container';
import { Document } from '../document';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { LABEL_COLORS } from '$lib/types/labelColors';

export class LabelImage {

    private readonly outputCanvas =
        document.createElement('canvas');

    private readonly maskCanvas =
        document.createElement('canvas');

    private readonly outputContext: CanvasRenderingContext2D;

    private readonly maskContext: CanvasRenderingContext2D;

    readonly outputImage: Konva.Image;

    /*
     * Procedurally generated brush.
     *
     * The brush contains only:
     *
     * alpha = 0
     * alpha = 255
     *
     * Therefore there are no anti-aliased edge pixels.
     */
    private brushCanvas =
        document.createElement('canvas');

    private brushRadius = -1;

    private brushLabelValue = -1;

    private brushColor = '';

    private _created = false;

    get created(): boolean {
        return this._created;
    }

    constructor() {

        const outputContext =
            this.outputCanvas.getContext('2d');

        const maskContext =
            this.maskCanvas.getContext('2d');

        if (!outputContext || !maskContext) {
            throw new Error(
                'Failed to create label image contexts.',
            );
        }

        this.outputContext = outputContext;
        this.maskContext = maskContext;

        /*
         * Important:
         *
         * The brush is a raster image and is always drawn
         * at integer coordinates. Disable image interpolation.
         */
        this.outputContext.imageSmoothingEnabled = false;
        this.maskContext.imageSmoothingEnabled = false;

        this.outputImage = new Konva.Image({
            image: this.outputCanvas,
            x: 0,
            y: 0,
            listening: false,
        });
    }

    create(
        width: number,
        height: number,
    ): void {

        this.setSize(
            width,
            height,
        );

        this.clear();

        this._created = true;
    }

    setSize(
        width: number,
        height: number,
    ): void {

        this.outputCanvas.width = width;
        this.outputCanvas.height = height;

        this.maskCanvas.width = width;
        this.maskCanvas.height = height;

        /*
         * The output canvas is transparent.
         */
        this.outputContext.clearRect(
            0,
            0,
            width,
            height,
        );

        /*
         * The mask canvas is always opaque white.
         *
         * 255 = background / unlabeled.
         */
        this.maskContext.fillStyle =
            'rgb(255, 255, 255)';

        this.maskContext.fillRect(
            0,
            0,
            width,
            height,
        );

        this.outputImage.size({
            width,
            height,
        });

        this.outputImage.offset({
            x: width / 2,
            y: height / 2,
        });

        this.invalidateBrush();

        this.refresh();
    }

    clear(): void {

        const width =
            this.outputCanvas.width;

        const height =
            this.outputCanvas.height;

        /*
         * Clear visual canvas.
         */
        this.outputContext.clearRect(
            0,
            0,
            width,
            height,
        );

        /*
         * Reset mask to 255.
         */
        this.maskContext.fillStyle =
            'rgb(255, 255, 255)';

        this.maskContext.fillRect(
            0,
            0,
            width,
            height,
        );

        this._created = false;

        this.refresh();
    }

    private invalidateBrush(): void {
        this.brushRadius = -1;
        this.brushLabelValue = -1;
        this.brushColor = '';
    }

    private createBrush(
        radius: number,
        labelValue: number,
        color: string,
    ): void {

        const diameter =
            radius * 2 + 1;

        const brush =
            document.createElement('canvas');

        brush.width = diameter;
        brush.height = diameter;

        const context =
            brush.getContext('2d');

        if (!context) {
            throw new Error(
                'Failed to create brush context.',
            );
        }

        /*
         * We generate the brush directly as pixels.
         *
         * There is NO arc().
         * There is NO fill().
         * There is NO geometric anti-aliasing.
         */
        const imageData =
            context.createImageData(
                diameter,
                diameter,
            );

        const radiusSquared =
            radius * radius;

        const red =
            Number.parseInt(
                color.slice(1, 3),
                16,
            );

        const green =
            Number.parseInt(
                color.slice(3, 5),
                16,
            );

        const blue =
            Number.parseInt(
                color.slice(5, 7),
                16,
            );

        for (
            let y = 0;
            y < diameter;
            y++
        ) {
            const dy =
                y - radius;

            for (
                let x = 0;
                x < diameter;
                x++
            ) {
                const dx =
                    x - radius;

                if (
                    dx * dx +
                    dy * dy >
                    radiusSquared
                ) {
                    continue;
                }

                const offset =
                    (y * diameter + x) * 4;

                imageData.data[offset] =
                    red;

                imageData.data[offset + 1] =
                    green;

                imageData.data[offset + 2] =
                    blue;

                imageData.data[offset + 3] =
                    255;
            }
        }

        /*
         * Put the hard-edged brush into the brush canvas.
         */
        context.putImageData(
            imageData,
            0,
            0,
        );

        this.brushCanvas = brush;

        this.brushRadius = radius;
        this.brushLabelValue = labelValue;
        this.brushColor = color;
    }

    private ensureBrush(
        radius: number,
        labelValue: number,
    ): void {

        const label =
            sessionStore.labeling.activeLabels[
            labelValue
            ];

        const color =
            label.color;

        if (
            this.brushRadius === radius &&
            this.brushLabelValue === labelValue &&
            this.brushColor === color
        ) {
            return;
        }

        this.createBrush(
            radius,
            labelValue,
            color,
        );
    }

    drawCircle(
        x: number,
        y: number,
        radius: number,
        labelValue: number,
    ): void {

        if (
            labelValue < 0 ||
            labelValue > 254 ||
            !Number.isInteger(labelValue)
        ) {
            throw new Error(
                'Label value must be an integer between 0 and 254.',
            );
        }

        const brushRadius =
            Math.ceil(radius);

        this.ensureBrush(
            brushRadius,
            labelValue,
        );

        const offset =
            brushRadius;

        const drawX =
            Math.round(x) - offset;

        const drawY =
            Math.round(y) - offset;

        /*
         * Draw the exact same hard-edged raster brush
         * onto the visual canvas.
         */
        this.outputContext.drawImage(
            this.brushCanvas,
            drawX,
            drawY,
        );

        /*
         * The brush currently contains the actual label color.
         *
         * For the mask canvas we need the numerical label value,
         * not the display color.
         *
         * Therefore temporarily convert the brush pixels
         * into the corresponding label value.
         */
        this.drawMaskBrush(
            drawX,
            drawY,
            brushRadius,
            labelValue,
        );

        this.refresh();
    }

    private drawMaskBrush(
        x: number,
        y: number,
        radius: number,
        labelValue: number,
    ): void {

        const diameter =
            radius * 2 + 1;

        /*
         * Generate a mask brush only when needed.
         *
         * This is intentionally separate from the display brush.
         */
        const maskBrush =
            document.createElement('canvas');

        maskBrush.width = diameter;
        maskBrush.height = diameter;

        const context =
            maskBrush.getContext('2d');

        if (!context) {
            throw new Error(
                'Failed to create mask brush context.',
            );
        }

        const imageData =
            context.createImageData(
                diameter,
                diameter,
            );

        const radiusSquared =
            radius * radius;

        for (
            let y = 0;
            y < diameter;
            y++
        ) {
            const dy =
                y - radius;

            for (
                let x = 0;
                x < diameter;
                x++
            ) {
                const dx =
                    x - radius;

                if (
                    dx * dx +
                    dy * dy >
                    radiusSquared
                ) {
                    continue;
                }

                const offset =
                    (y * diameter + x) * 4;

                imageData.data[offset] =
                    labelValue;

                imageData.data[offset + 1] =
                    labelValue;

                imageData.data[offset + 2] =
                    labelValue;

                imageData.data[offset + 3] =
                    255;
            }
        }

        context.putImageData(
            imageData,
            0,
            0,
        );

        this.maskContext.drawImage(
            maskBrush,
            x,
            y,
        );
    }

    eraseCircle(
        x: number,
        y: number,
        radius: number,
    ): void {

        const brushRadius =
            Math.ceil(radius);

        const diameter =
            brushRadius * 2 + 1;

        const brush =
            document.createElement('canvas');

        brush.width = diameter;
        brush.height = diameter;

        const context =
            brush.getContext('2d');

        if (!context) {
            throw new Error(
                'Failed to create erase brush context.',
            );
        }

        const imageData =
            context.createImageData(
                diameter,
                diameter,
            );

        const radiusSquared =
            brushRadius *
            brushRadius;

        for (
            let y = 0;
            y < diameter;
            y++
        ) {
            const dy =
                y - brushRadius;

            for (
                let x = 0;
                x < diameter;
                x++
            ) {
                const dx =
                    x - brushRadius;

                if (
                    dx * dx +
                    dy * dy >
                    radiusSquared
                ) {
                    continue;
                }

                const offset =
                    (y * diameter + x) * 4;

                /*
                 * 255 = background.
                 */
                imageData.data[offset] =
                    255;

                imageData.data[offset + 1] =
                    255;

                imageData.data[offset + 2] =
                    255;

                imageData.data[offset + 3] =
                    255;
            }
        }

        context.putImageData(
            imageData,
            0,
            0,
        );

        const drawX =
            Math.round(x) -
            brushRadius;

        const drawY =
            Math.round(y) -
            brushRadius;

        /*
         * Remove labels from visual canvas.
         */
        this.outputContext.save();

        this.outputContext.globalCompositeOperation =
            'destination-out';

        this.outputContext.drawImage(
            brush,
            drawX,
            drawY,
        );

        this.outputContext.restore();

        /*
         * Write 255 to mask canvas.
         */
        this.maskContext.drawImage(
            brush,
            drawX,
            drawY,
        );

        this.refresh();
    }

    refresh(): void {
        this.outputImage.image(
            this.outputCanvas,
        );
    }

    setVisible(
        visible: boolean,
    ): void {
        this.outputImage.visible(
            visible,
        );
    }

    setOpacity(
        opacity: number,
    ): void {
        this.outputImage.opacity(
            Math.max(
                0,
                Math.min(1, opacity),
            ),
        );
    }

    new(): void {

        const document =
            contextContainer.resolve<Document>(
                CONTEXT.Document,
            );

        this.create(
            document.state.width,
            document.state.height,
        );

        this.setOpacity(
            sessionStore.labeling.globalOpacity /
            100,
        );

        if (
            !document.group.children.includes(
                this.outputImage,
            )
        ) {
            document.group.add(
                this.outputImage,
            );
        }

        sessionStore.labeling.activeLabels = [];

        document.events.emit(
            'layerRedraw',
        );

        sessionStore.labeling.enabled = true;
        sessionStore.hasLabelImage = true;
    }

    delete(): void {

        const document =
            contextContainer.resolve<Document>(
                CONTEXT.Document,
            );

        this.clear();

        this.outputImage.remove();

        sessionStore.labeling.activeLabels = [];

        document.events.emit(
            'layerRedraw',
        );

        sessionStore.labeling.enabled = false;
        sessionStore.hasLabelImage = false;
    }

    get mask(): HTMLCanvasElement {
        return this.maskCanvas;
    }

    get output(): HTMLCanvasElement {
        return this.outputCanvas;
    }

    async save(): Promise<Uint8Array> {
        const width = this.maskCanvas.width;
        const height = this.maskCanvas.height;

        if (width <= 0 || height <= 0) {
            throw new Error(
                'Cannot save an empty label image.',
            );
        }

        /*
         * The mask canvas contains:
         *
         * 0   = label 0
         * 1   = label 1
         * 2   = label 2
         * ...
         * 255 = background
         *
         * We explicitly create an 8-bit grayscale PNG.
         */

        const source = this.maskContext.getImageData(
            0,
            0,
            width,
            height,
        );

        /*
         * PNG scanlines:
         *
         * one filter byte + one grayscale byte per pixel.
         */
        const scanlines = new Uint8Array(
            height * (width + 1),
        );

        for (let y = 0; y < height; y++) {
            const scanlineOffset =
                y * (width + 1);

            const sourceOffset =
                y * width * 4;

            scanlines[scanlineOffset] = 0;

            for (let x = 0; x < width; x++) {
                scanlines[
                    scanlineOffset + 1 + x
                ] =
                    source.data[
                    sourceOffset + x * 4
                    ];
            }
        }

        const compressedStream =
            new Blob([scanlines])
                .stream()
                .pipeThrough(
                    new CompressionStream('deflate'),
                );

        const compressed =
            new Uint8Array(
                await new Response(
                    compressedStream,
                ).arrayBuffer(),
            );

        const signature = new Uint8Array([
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ]);

        /*
         * IHDR:
         *
         * bit depth  = 8
         * color type = 0 (grayscale)
         */
        const ihdr = new Uint8Array(13);

        const ihdrView =
            new DataView(ihdr.buffer);

        ihdrView.setUint32(
            0,
            width,
        );

        ihdrView.setUint32(
            4,
            height,
        );

        ihdr[8] = 8;
        ihdr[9] = 0;
        ihdr[10] = 0;
        ihdr[11] = 0;
        ihdr[12] = 0;

        const createChunk = (
            type: string,
            data: Uint8Array,
        ): Uint8Array => {
            const typeBytes =
                new TextEncoder().encode(type);

            const chunk = new Uint8Array(
                4 +
                typeBytes.length +
                data.length +
                4,
            );

            const view =
                new DataView(chunk.buffer);

            view.setUint32(
                0,
                data.length,
            );

            chunk.set(
                typeBytes,
                4,
            );

            chunk.set(
                data,
                4 + typeBytes.length,
            );

            let crc = 0xffffffff;

            for (
                let i = 4;
                i <
                4 +
                typeBytes.length +
                data.length;
                i++
            ) {
                crc ^= chunk[i];

                for (
                    let bit = 0;
                    bit < 8;
                    bit++
                ) {
                    const mask = -(crc & 1);

                    crc =
                        (crc >>> 1) ^
                        (0xedb88320 & mask);
                }
            }

            crc =
                (crc ^ 0xffffffff) >>> 0;

            view.setUint32(
                4 +
                typeBytes.length +
                data.length,
                crc,
            );

            return chunk;
        };

        const ihdrChunk =
            createChunk(
                'IHDR',
                ihdr,
            );

        const idatChunk =
            createChunk(
                'IDAT',
                compressed,
            );

        const iendChunk =
            createChunk(
                'IEND',
                new Uint8Array(0),
            );

        const result =
            new Uint8Array(
                signature.length +
                ihdrChunk.length +
                idatChunk.length +
                iendChunk.length,
            );

        let offset = 0;

        result.set(
            signature,
            offset,
        );

        offset += signature.length;

        result.set(
            ihdrChunk,
            offset,
        );

        offset += ihdrChunk.length;

        result.set(
            idatChunk,
            offset,
        );

        offset += idatChunk.length;

        result.set(
            iendChunk,
            offset,
        );

        return result;
    }

    async load(
        imageBytes: Uint8Array,
        expectedWidth: number,
        expectedHeight: number,
    ): Promise<void> {
        const buffer = new ArrayBuffer(imageBytes.byteLength);

        new Uint8Array(buffer).set(imageBytes);

        const blob = new Blob([
            buffer,
        ], {
            type: 'image/png',
        });

        const bitmap =
            await createImageBitmap(blob);

        const width = bitmap.width;
        const height = bitmap.height;

        /*
         * The label image must have exactly the same
         * dimensions as the document.
         */
        if (
            width !== expectedWidth ||
            height !== expectedHeight
        ) {
            bitmap.close();

            throw new Error(
                'Label image dimensions do not match. ' +
                'Expected ' +
                String(expectedWidth) +
                'x' +
                String(expectedHeight) +
                ', got ' +
                String(width) +
                'x' +
                String(height) +
                '.',
            );
        }

        /*
         * Ensure our internal canvases have the correct size.
         */
        this.setSize(
            expectedWidth,
            expectedHeight,
        );

        /*
         * Decode the image into the mask canvas.
         *
         * IMPORTANT:
         * imageSmoothingEnabled = false prevents interpolation.
         */
        this.maskContext.imageSmoothingEnabled = false;

        this.maskContext.clearRect(
            0,
            0,
            expectedWidth,
            expectedHeight,
        );

        this.maskContext.drawImage(
            bitmap,
            0,
            0,
            expectedWidth,
            expectedHeight,
        );

        bitmap.close();

        /*
         * Normalize the decoded image to an actual
         * grayscale mask.
         */
        const imageData =
            this.maskContext.getImageData(
                0,
                0,
                expectedWidth,
                expectedHeight,
            );

        for (
            let index = 0;
            index < imageData.data.length;
            index += 4
        ) {
            const value =
                imageData.data[index];

            imageData.data[index] = value;
            imageData.data[index + 1] = value;
            imageData.data[index + 2] = value;
            imageData.data[index + 3] = 255;
        }

        this.maskContext.putImageData(
            imageData,
            0,
            0,
        );

        this.rebuildLabelsFromMask(
            imageData,
        );

        this.renderFromMask();

        this._created = true;

        this.refresh();
    }

    private rebuildLabelsFromMask(
        imageData: ImageData,
    ): void {
        let maxValue = -1;

        for (
            let index = 0;
            index < imageData.data.length;
            index += 4
        ) {
            const value =
                imageData.data[index];

            if (
                value !== 255 &&
                value > maxValue
            ) {
                maxValue = value;
            }
        }

        if (maxValue < 0) {
            sessionStore.labeling.activeLabels = [];
            return;
        }

        const activeLabels = [];

        for (
            let value = 0;
            value <= maxValue;
            value++
        ) {
            const labelColor =
                LABEL_COLORS[
                value % LABEL_COLORS.length
                ];

            activeLabels.push({
                id: value + 1,
                name: `Label ${String(value)}`,
                color: labelColor.color,
                visible: true,
                selected: value === 0,
            });
        }

        sessionStore.labeling.activeLabels =
            activeLabels;
    }

    private renderFromMask(): void {
        const width =
            this.maskCanvas.width;

        const height =
            this.maskCanvas.height;

        const maskData =
            this.maskContext.getImageData(
                0,
                0,
                width,
                height,
            );

        const outputData =
            this.outputContext.createImageData(
                width,
                height,
            );

        const activeLabels =
            sessionStore.labeling.activeLabels;

        for (
            let index = 0;
            index < maskData.data.length;
            index += 4
        ) {
            const value =
                maskData.data[index];

            const outputIndex = index;

            /*
             * 255 = background.
             */
            if (value === 255) {
                outputData.data[outputIndex] = 0;
                outputData.data[outputIndex + 1] = 0;
                outputData.data[outputIndex + 2] = 0;
                outputData.data[outputIndex + 3] = 0;

                continue;
            }

            const label =
                activeLabels[value];

            if (!label.visible) {
                outputData.data[outputIndex] = 0;
                outputData.data[outputIndex + 1] = 0;
                outputData.data[outputIndex + 2] = 0;
                outputData.data[outputIndex + 3] = 0;

                continue;
            }

            const color = label.color;

            if (
                !color.startsWith('#') ||
                color.length !== 7
            ) {
                outputData.data[outputIndex] = 0;
                outputData.data[outputIndex + 1] = 0;
                outputData.data[outputIndex + 2] = 0;
                outputData.data[outputIndex + 3] = 0;

                continue;
            }

            outputData.data[outputIndex] =
                Number.parseInt(
                    color.slice(1, 3),
                    16,
                );

            outputData.data[outputIndex + 1] =
                Number.parseInt(
                    color.slice(3, 5),
                    16,
                );

            outputData.data[outputIndex + 2] =
                Number.parseInt(
                    color.slice(5, 7),
                    16,
                );

            outputData.data[outputIndex + 3] =
                255;
        }

        this.outputContext.putImageData(
            outputData,
            0,
            0,
        );
    }

    public refreshOutput(): void {
        if (!this._created) {
            return;
        }

        this.reconcileMaskLabels();
        this.renderFromMask();
        this.refresh();

        const document =
            contextContainer.resolve<Document>(
                CONTEXT.Document,
            );

        document.events.emit(
            'layerRedraw',
        );
    }

    private reconcileMaskLabels(): void {
        const labelCount =
            sessionStore.labeling.activeLabels.length;

        const width =
            this.maskCanvas.width;

        const height =
            this.maskCanvas.height;

        const imageData =
            this.maskContext.getImageData(
                0,
                0,
                width,
                height,
            );

        const data =
            imageData.data;

        for (
            let index = 0;
            index < width * height;
            index++
        ) {
            const offset =
                index * 4;

            const value =
                data[offset];

            /*
             * 255 is always background.
             */
            if (value === 255) {
                continue;
            }

            /*
             * Valid values are:
             *
             * 0 ... labelCount - 1
             *
             * Everything above the currently
             * available labels becomes background.
             */
            if (value >= labelCount) {
                data[offset] = 255;
                data[offset + 1] = 255;
                data[offset + 2] = 255;
                data[offset + 3] = 255;
            }
        }

        this.maskContext.putImageData(
            imageData,
            0,
            0,
        );
    }
}