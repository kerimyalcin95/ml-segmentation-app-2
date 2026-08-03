import Konva from 'konva';
import { type FilterState, FilterType } from '$lib/types/filter';

interface ImageState {
    width: number;
    height: number;
    filters: FilterState[];
}

type ImageFilters = Parameters<Konva.Image["filters"]>[0];
type ImageFilter = NonNullable<ImageFilters>[number];

export class Image {

    // Getter/Setter variables

    // Private member variables
    outputImage?: Konva.Image;

    private readonly filterSourceCanvas = document.createElement("canvas");
    private readonly filterSourceContext;

    private readonly filterDestinationCanvas = document.createElement("canvas");
    private readonly filterDestinationContext;

    private _state: ImageState = {
        width: 0,
        height: 0,

        filters: [],
    };

    get state(): ImageState {
        return this._state;
    }

    constructor(
        private readonly sourceCanvas: HTMLCanvasElement
    ) {

        // Create document canvas context
        this.sourceCanvas = sourceCanvas

        // Create filter canvas contexts
        const filterSourceContext =
            this.filterSourceCanvas.getContext("2d");
        const filterDestinationContext =
            this.filterDestinationCanvas.getContext("2d");

        if (!filterSourceContext || !filterDestinationContext) {
            throw new Error("Failed to create filter rendering contexts.");
        }

        this.filterSourceContext = filterSourceContext;
        this.filterDestinationContext = filterDestinationContext;
    }

    resetState() {
        this._state = {
            width: 0,
            height: 0,

            filters: [],
        }
    }

    setSize(
        width: number,
        height: number,
    ): void {
        this._state.width = width;
        this._state.height = height;

        if (!this.outputImage) {
            return;
        }

        this.outputImage.setSize({
            width: width,
            height: height
        });

        this.outputImage.offset({
            x: width / 2,
            y: height / 2,
        });
    }

    // Filter

    addFilter(filter: FilterState): void {
        this._state.filters.push(filter);

        this.applyFilters();
    }

    setFilters(filters: FilterState[]): void {
        this._state.filters = [...filters];

        this.applyFilters();
    }

    private configureFilter(
        image: Konva.Image,
        filter: FilterState,
    ): ImageFilter | null {

        switch (filter.type) {
            case FilterType.Blur:
                image.blurRadius(filter.blurRadius);
                return Konva.Filters.Blur;

            case FilterType.Brighten:
                image.brightness(filter.brightness);
                return Konva.Filters.Brighten;

            case FilterType.Contrast:
                image.contrast(filter.contrast);
                return Konva.Filters.Contrast;

            case FilterType.Enhance:
                image.enhance(filter.enhance);
                return Konva.Filters.Enhance;

            case FilterType.Grayscale:
                return Konva.Filters.Grayscale;

            case FilterType.HSL:
                image.hue(filter.hue);
                image.saturation(filter.saturation);
                image.luminance(filter.luminance);
                return Konva.Filters.HSL;

            case FilterType.Invert:
                return Konva.Filters.Invert;

            case FilterType.Mask:
                image.threshold(filter.threshold);
                return Konva.Filters.Mask;

            case FilterType.Noise:
                image.noise(filter.noise);
                return Konva.Filters.Noise;

            case FilterType.Pixelate:
                image.pixelSize(filter.pixelSize);
                return Konva.Filters.Pixelate;

            case FilterType.Posterize:
                image.levels(filter.levels);
                return Konva.Filters.Posterize;

            case FilterType.RGB:
                image.red(filter.red);
                image.green(filter.green);
                image.blue(filter.blue);
                return Konva.Filters.RGB;

            case FilterType.Sepia:
                return Konva.Filters.Sepia;

            case FilterType.Solarize:
                return Konva.Filters.Solarize;

            case FilterType.Threshold:
                image.threshold(filter.threshold);
                return Konva.Filters.Threshold;

            default:
                return null;
        }
    }

    applyFilters(): void {
        if (!this.outputImage) {
            return;
        }

        if (
            this.filterSourceCanvas.width !== this.sourceCanvas.width ||
            this.filterSourceCanvas.height !== this.sourceCanvas.height
        ) {
            this.filterSourceCanvas.width = this.sourceCanvas.width;
            this.filterSourceCanvas.height = this.sourceCanvas.height;
        }

        if (
            this.filterDestinationCanvas.width !== this.sourceCanvas.width ||
            this.filterDestinationCanvas.height !== this.sourceCanvas.height
        ) {
            this.filterDestinationCanvas.width = this.sourceCanvas.width;
            this.filterDestinationCanvas.height = this.sourceCanvas.height;
        }

        const sourceContext = this.filterSourceContext;
        const destinationContext = this.filterDestinationContext;

        const padding = 64; // or compute from the filter

        sourceContext.clearRect(
            0,
            0,
            this.filterSourceCanvas.width,
            this.filterSourceCanvas.height,
        );

        sourceContext.drawImage(
            this.sourceCanvas,
            0,
            0,
        );

        this.outputImage.clearCache();

        // Image filtering pipeline
        for (const filter of this._state.filters) {

            const konvaFilter = this.configureFilter(
                this.outputImage,
                filter,
            );

            if (!konvaFilter) {
                continue;
            }

            this.outputImage.image(this.filterSourceCanvas);
            this.outputImage.filters([konvaFilter]);
            this.outputImage.cache({
                x: -padding,
                y: -padding,
                width: this.sourceCanvas.width + padding * 2,
                height: this.sourceCanvas.height + padding * 2,
            });

            destinationContext.clearRect(
                0,
                0,
                this.filterDestinationCanvas.width,
                this.filterDestinationCanvas.height,
            );

            // Draw the previous image.
            destinationContext.globalAlpha = 1;
            destinationContext.globalCompositeOperation = "source-over";

            destinationContext.drawImage(
                this.filterSourceCanvas,
                0,
                0,
            );

            // Blend the filtered image over it.
            destinationContext.globalAlpha = filter.opacity;
            destinationContext.globalCompositeOperation =
                filter.blendMode;

            destinationContext.drawImage(
                this.outputImage.toCanvas({
                    pixelRatio: 1,
                }),
                0,
                0,
                this.filterSourceCanvas.width,
                this.filterSourceCanvas.height,
            );

            destinationContext.globalAlpha = 1;
            destinationContext.globalCompositeOperation = "source-over";

            // Clear cache, otherwise opacity and blendmode will not work
            this.outputImage.filters([]);
            this.outputImage.clearCache();

            sourceContext.clearRect(
                0,
                0,
                this.filterSourceCanvas.width,
                this.filterSourceCanvas.height,
            );

            sourceContext.drawImage(
                this.filterDestinationCanvas,
                0,
                0,
            );
        }

        // Do not overwrite the document canvas
        // this.documentContext.clearRect(
        //     0,
        //     0,
        //     this.documentCanvas.width,
        //     this.documentCanvas.height,
        // );

        // this.documentContext.drawImage(
        //     this.filterSourceCanvas,
        //     0,
        //     0,
        // );

        this.outputImage.image(this.filterSourceCanvas);
    }
}