import { writable } from 'svelte/store';

export const isOnline = writable(0);

export function setupConnectivity() {
    const electronAPI = window.electronAPI;

    // Browser-only dev mode has no Electron preload bridge.
    if (!electronAPI) {
        isOnline.set(0);
        return () => {
            // no-op cleanup in non-Electron runtime
        };
    }

    let received = false;

    const retry = setInterval(() => {
        if (!received) {
            electronAPI.sendMessage("0");
            electronAPI.log("Retrying to connect");
        }
    }, 1000);

    const unsubscribe = electronAPI.onMessage((msg: string) => {
        received = true;
        clearInterval(retry);

        let state = parseInt(msg) || 0;

        if (state === 0) state = 1;

        isOnline.set(state);
    });

    return () => {
        clearInterval(retry);
        unsubscribe();
    };
}