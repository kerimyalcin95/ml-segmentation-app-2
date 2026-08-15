<script lang="ts">
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';

import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

async function selectDatasetPath(): Promise<void> {
    const path = await window.electronAPI.showOpenDatasetDialog(
        sessionStore.training.datasetPath,
    );

    if (!path) {
        return;
    }

    sessionStore.training.datasetPath = path;
}
</script>

<div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
        <Label class="ml-0.5" for="training-dataset-path">Dataset Path</Label>

        <div class="flex items-center gap-2">
            <Input
                id="training-dataset-path"
                class="flex-1"
                bind:value={sessionStore.training.datasetPath}
                placeholder="Dataset directory"
                disabled={sessionStore.training.running}
            />

            <Button
                size="icon"
                disabled={sessionStore.training.running}
                onclick={selectDatasetPath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
            <Label class="ml-0.5" for="training-batch-size">Batch Size</Label>

            <Input
                id="training-batch-size"
                type="number"
                min="1"
                step="1"
                bind:value={sessionStore.training.batchSize}
                disabled={sessionStore.training.running}
            />
        </div>

        <div class="flex flex-col gap-1">
            <Label class="ml-0.5" for="training-workers">Workers</Label>

            <Input
                id="training-workers"
                type="number"
                min="0"
                step="1"
                bind:value={sessionStore.training.numWorkers}
                disabled={sessionStore.training.running}
            />
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <Label class="ml-0.5" for="training-epochs">Epochs</Label>

        <Input
            id="training-epochs"
            type="number"
            min="1"
            step="1"
            bind:value={sessionStore.training.epochs}
            disabled={sessionStore.training.running}
        />
    </div>
</div>
