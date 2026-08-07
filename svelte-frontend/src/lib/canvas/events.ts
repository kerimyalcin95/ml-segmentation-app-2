import { type CameraState } from "./camera";
import { type DocumentState } from "./document";

export type CanvasEvents = {
    cameraState: {state: CameraState};
    cameraRefresh: undefined;
    layerRedraw: undefined;

    documentResize: {
        width: number;
        height: number;
    };

    documentState: {state: DocumentState}

    cameraCenter: undefined;

    workspaceResize: {
        width: number;
        height: number;
    }

    wheel: undefined;

    brushEnable: boolean;
};