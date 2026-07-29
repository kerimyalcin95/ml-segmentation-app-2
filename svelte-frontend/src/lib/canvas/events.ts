export type CanvasEvents = {
    refreshCamera: undefined;
    redrawLayer: undefined;

    documentResize: {
        width: number;
        height: number;
    };
};