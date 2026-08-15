<script lang="ts">
import { Button } from '$lib/components/ui/button';

import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
import StopIcon from 'phosphor-svelte/lib/StopIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

function startTraining(): void {
    if (sessionStore.training.running) {
        return;
    }

    if (!sessionStore.training.datasetPath) {
        return;
    }

    sessionStore.training.running = true;

    window.electronAPI.sendToServer(
        JSON.stringify({
            action: 'train',
            datasetPath:
                sessionStore.training.datasetPath,
            modelPath:
                sessionStore.training.modelPath,
            batchSize:
                sessionStore.training.batchSize,
            numWorkers:
                sessionStore.training.numWorkers,
            epochs:
                sessionStore.training.epochs,
        }),
    );
}
</script>

<div class="flex flex-col gap-2">

    <Button
        onclick={startTraining}
        disabled={
            sessionStore.training.running ||
            !sessionStore.training.datasetPath
        }
    >
        <PlayIcon weight="bold" />
        Start Training
    </Button>

    <Button
        variant="destructive"
        disabled={!sessionStore.training.running}
    >
        <StopIcon weight="bold" />
        Stop Training
    </Button>
</div>