<script lang="ts">
import { Button } from '$lib/components/ui/button';

import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
import StopIcon from 'phosphor-svelte/lib/StopIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

let unsubscribe: (() => void) | undefined;

let trainingError = $state<string | null>(null);
let trainingErrorDialogOpen = $state(false);

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

            if (response.action === 'train-success') {
                sessionStore.training.running = false;
                return;
            }

            if (response.action === 'train-error') {
                trainingError =
                    'error' in response &&
                    typeof response.error === 'string'
                        ? response.error
                        : 'Training failed.';

                sessionStore.training.running = false;
                trainingErrorDialogOpen = true;
                return;
            }

            if (response.action === 'train-cancelled') {
                sessionStore.training.running = false;
                return;
            }
        },
    );

    return () => {
        unsubscribe?.();
        unsubscribe = undefined;
    };
});

function startTraining(): void {
    if (sessionStore.training.running) {
        return;
    }

    if (!sessionStore.training.configured) {
        return;
    }

    trainingError = null;

    sessionStore.training.running = true;

    window.electronAPI.sendToServer(
        JSON.stringify({
            action: 'train-start',

            imagePath: sessionStore.training.imagePath,
            labelImagePath: sessionStore.training.labelImagePath,
            labelPath: sessionStore.training.labelPath,
            modelPath: sessionStore.training.modelPath,

            batchSize: sessionStore.training.batchSize,
            numWorkers: sessionStore.training.numWorkers,
            epochs: sessionStore.training.epochs,

            validationPercent:
                sessionStore.training.validationPercent,
            seed: sessionStore.training.seed,
            architecture:
                sessionStore.training.architecture,
            pretrained:
                sessionStore.training.pretrained,
        }),
    );
}

function stopTraining(): void {
    if (!sessionStore.training.running) {
        return;
    }

    window.electronAPI.sendToServer(
        JSON.stringify({
            action: 'train-stop',
        }),
    );
}
</script>

<MessageDialog
    bind:open={trainingErrorDialogOpen}
    title="Training Error"
    message={trainingError ?? 'Training failed.'}
/>

<div class="flex flex-col gap-2">
    <Button
        onclick={startTraining}
        disabled={
            sessionStore.training.running ||
            !sessionStore.training.configured
        }
    >
        <PlayIcon weight="bold" />
        Start Training
    </Button>

    <Button
        variant="destructive"
        onclick={stopTraining}
        disabled={!sessionStore.training.running}
    >
        <StopIcon weight="bold" />
        Stop Training
    </Button>
</div>