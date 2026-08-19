<script lang="ts">
import { Button } from '$lib/components/ui/button';

import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
import StopIcon from 'phosphor-svelte/lib/StopIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';

let unsubscribe: (() => void) | undefined;

let predictionError = $state<string | null>(null);
let predictionErrorDialogOpen = $state(false);

$effect(() => {
    const electronAPI = window.electronAPI;

    // Browser-only development mode.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!electronAPI) {
        return;
    }

    unsubscribe = electronAPI.subscribeServerMessages(
        (message: string) => {
            let response: unknown;

            try {
                response = JSON.parse(message);
            } catch {
                return;
            }

            if (
                typeof response !== 'object' ||
                response === null ||
                !('action' in response)
            ) {
                return;
            }

            if (response.action === 'predict-success') {
                sessionStore.prediction.running = false;
                return;
            }

            if (response.action === 'predict-error') {
                predictionError =
                    'error' in response &&
                    typeof response.error === 'string'
                        ? response.error
                        : 'Prediction failed.';

                sessionStore.prediction.running = false;
                predictionErrorDialogOpen = true;
                return;
            }

            if (response.action === 'predict-cancelled') {
                sessionStore.prediction.running = false;
                return;
            }
        },
    );

    return () => {
        unsubscribe?.();
        unsubscribe = undefined;
    };
});

async function startPrediction(): Promise<void> {
    if (sessionStore.prediction.running) {
        return;
    }

    if (!sessionStore.prediction.configured) {
        return;
    }

    predictionError = null;

    sessionStore.prediction.running = true;
    sessionStore.viewMode = 'terminal';
    await localStorage.save();

    window.electronAPI.sendToServer(
        JSON.stringify({
            action: 'predict-start',

            imagePath:
                sessionStore.prediction.imagePath,

            modelPath:
                sessionStore.prediction.modelPath,

            labelImagePath:
                sessionStore.prediction.labelImagePath,
        }),
    );
}

function stopPrediction(): void {
    if (!sessionStore.prediction.running) {
        return;
    }

    window.electronAPI.sendToServer(
        JSON.stringify({
            action: 'predict-stop',
        }),
    );
}
</script>

<MessageDialog
    bind:open={predictionErrorDialogOpen}
    title="Prediction Error"
    message={
        predictionError ?? 'Prediction failed.'
    }
/>

<div class="flex flex-col gap-2">
    <Button
        onclick={startPrediction}
        disabled={
            sessionStore.prediction.running ||
            !sessionStore.prediction.configured
        }
    >
        <PlayIcon weight="bold" />
        Start Prediction
    </Button>

    <Button
        variant="destructive"
        onclick={stopPrediction}
        disabled={!sessionStore.prediction.running}
    >
        <StopIcon weight="bold" />
        Stop Prediction
    </Button>
</div>