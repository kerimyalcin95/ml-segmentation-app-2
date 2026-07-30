import { type CameraState } from "./camera";

export type CanvasEvents = {
    cameraChange: {state: CameraState};
    refreshCamera: undefined;
    redrawLayer: undefined;

    documentResize: {
        width: number;
        height: number;
    };

    documentChange: undefined;
};