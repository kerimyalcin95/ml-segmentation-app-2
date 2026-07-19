import Konva from 'konva';

export class CanvasManager {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private imageGroup: Konva.Group;
    private imageNode?: Konva.Image;

    private container: HTMLDivElement;

    private viewportWidth = 0;
    private viewportHeight = 0;

    private imageWidth = 0;
    private imageHeight = 0;


    constructor(container: HTMLDivElement, viewport: HTMLDivElement) {
        this.container = container;

        this.viewportWidth = viewport.clientWidth;
        this.viewportHeight = viewport.clientHeight;

        this.stage = new Konva.Stage({
            container,
            width: this.viewportWidth,
            height: this.viewportHeight,
        });

        this.layer = new Konva.Layer();

        this.imageGroup = new Konva.Group();

        this.layer.add(this.imageGroup);
        this.stage.add(this.layer);

        this.updateContainerSize();

        this.setupZoom();
    }


    resize(viewport: HTMLDivElement) {
        this.viewportWidth = viewport.clientWidth;
        this.viewportHeight = viewport.clientHeight;

        this.stage.width(this.viewportWidth);
        this.stage.height(this.viewportHeight);

        this.updateContainerSize();
    }


    private updateContainerSize() {
        const scale = this.imageGroup.scaleX();

        const width = Math.max(
            this.viewportWidth,
            this.imageWidth * scale
        );

        const height = Math.max(
            this.viewportHeight,
            this.imageHeight * scale
        );

        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;

        this.stage.width(width);
        this.stage.height(height);
    }


    async loadImage(path: string) {
        const image = new Image();

        image.onload = () => {
            this.imageWidth = image.width;
            this.imageHeight = image.height;

            this.imageGroup.scale({
                x: 1,
                y: 1,
            });

            this.imageGroup.position({
                x: 0,
                y: 0,
            });


            this.imageGroup.destroyChildren();


            const konvaImage = new Konva.Image({
                image,
                x: 0,
                y: 0,
                width: this.imageWidth,
                height: this.imageHeight,
                listening: false,
            });

            this.imageNode = konvaImage;

            this.imageGroup.add(konvaImage);

            this.updateContainerSize();

            this.layer.batchDraw();
        };


        image.src = `file://${path}`;
    }


    private setupZoom() {
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();

            const scaleBy = 1.1;

            const oldScale = this.imageGroup.scaleX();

            const pointer = this.stage.getPointerPosition();

            if (!pointer) return;


            const mousePointTo = {
                x: (pointer.x - this.imageGroup.x()) / oldScale,
                y: (pointer.y - this.imageGroup.y()) / oldScale,
            };


            let newScale =
                e.evt.deltaY > 0
                    ? oldScale / scaleBy
                    : oldScale * scaleBy;


            newScale = Math.max(
                0.1,
                Math.min(5, newScale)
            );


            this.imageGroup.scale({
                x: newScale,
                y: newScale,
            });


            // this.imageGroup.position({
            //     x: pointer.x - mousePointTo.x * newScale,
            //     y: pointer.y - mousePointTo.y * newScale,
            // });

            this.imageGroup.position({
                x: 0,
                y: 0,
            });


            this.updateContainerSize();

            this.layer.batchDraw();
        });
    }

    setGrayscale(enabled: boolean) {
        if (!this.imageNode) return;

        if (enabled) {
            this.imageNode.filters([
                Konva.Filters.Grayscale,
            ]);
        } else {
            this.imageNode.filters([]);
        }

        this.imageNode.cache();
        this.layer.batchDraw();
    }
    
    destroy() {
        this.stage.destroy();
    }
}
