import { writable } from 'svelte/store';

export const isOnline = writable(0);

export function setupConnectivity() {
    const electronAPI = window.electronAPI;

    // Browser-only dev mode has no Electron preload bridge.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!electronAPI) {
        isOnline.set(0);
        return () => {
            // no-op cleanup in non-Electron runtime
        };
    }

    let firstReceived = false;
    let firstAttempt = true;

    const retry = setInterval(() => {

        if (!firstReceived) {
            electronAPI.log("FE: Sending test message");
            electronAPI.sendToServer("Test message received");

            if (!firstAttempt) {
                electronAPI.log("FE: Retrying to send test message");
            }
        }

        firstAttempt = false;
        
    }, 1000);

    const unsubscribe = electronAPI.subscribeServerMessages((msg: string) => {

        if (!firstReceived) {
            firstReceived = true;
            clearInterval(retry);

            electronAPI.log("FE: " + msg);
            electronAPI.log("FE: Connection between Electron and Python server successful");

            let state = parseInt(msg) || 0;

            if (state === 0) {
                state = 1;
            }

            isOnline.set(state);
        } else {
            electronAPI.log("FE: Server message received");
        }
    });

    return () => {
        clearInterval(retry);
        unsubscribe();
    };
}