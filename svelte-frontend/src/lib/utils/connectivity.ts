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

            electronAPI.log(
                "FE: Sending test message",
            );

            electronAPI.sendToServer(
                JSON.stringify({
                    action: "test",
                }),
            );

            if (!firstAttempt) {
                electronAPI.log(
                    "FE: Retrying to send test message",
                );
            }
        }

        firstAttempt = false;

    }, 5000);

    const unsubscribe =
        electronAPI.subscribeServerMessages(
            (msg: string) => {

                let response: unknown;

                try {
                    response = JSON.parse(msg);
                } catch {
                    electronAPI.log(
                        "FE: Invalid server response",
                    );
                    return;
                }

                if (
                    typeof response !== "object" ||
                    response === null ||
                    !("action" in response) ||
                    response.action !== "test-success"
                ) {
                    return;
                }

                firstReceived = true;
                clearInterval(retry);

                electronAPI.log(
                    "FE: " + msg,
                );

                electronAPI.log(
                    "FE: Connection between Electron " +
                    "and Python server successful",
                );

                isOnline.set(1);
            },
        );

    return () => {
        clearInterval(retry);
        unsubscribe();
    };
}