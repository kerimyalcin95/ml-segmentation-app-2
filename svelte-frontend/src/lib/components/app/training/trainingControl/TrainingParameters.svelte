<script lang="ts">
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
</script>

<div class="flex flex-col gap-3">
    <span class="text-sm font-medium">
        Training Parameters
    </span>

    <div class="flex flex-col gap-1">
        <Label for="training-dataset-path">
            Dataset Path
        </Label>

        <Input
            id="training-dataset-path"
            bind:value={sessionStore.training.datasetPath}
            placeholder="Dataset directory"
            disabled={sessionStore.training.running}
        />
    </div>

    <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
            <Label for="training-batch-size">
                Batch Size
            </Label>

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
            <Label for="training-workers">
                Workers
            </Label>

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
        <Label for="training-epochs">
            Epochs
        </Label>

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