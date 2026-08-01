import { type CameraState } from "./camera";

export type CanvasEvents = {
    cameraState: {state: CameraState};
    cameraRefresh: undefined;
    layerRedraw: undefined;

    documentResize: {
        width: number;
        height: number;
    };

    cameraCenter: undefined;

    workspaceResize: {
        width: number;
        height: number;
    }

    wheel: undefined;
};