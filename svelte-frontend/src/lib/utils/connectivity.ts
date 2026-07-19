import { writable } from 'svelte/store';

export const isOnline = writable(0);

export function setupConnectivity() {
    let received = false;

    const retry = setInterval(() => {
        if (!received) {
            window.electronAPI.sendMessage(isOnline.toString());
            window.electronAPI.log("Retrying to connect");
        }
    }, 1000);

    const unsubscribe = window.electronAPI.onMessage((msg: string) => {
        received = true;
        clearInterval(retry);

        let state = parseInt(msg) || 0;

        if (state === 0) state = 1;

        isOnline.set(state);
    });

    return () => {
        clearInterval(retry);
    };
}