<script lang="ts">
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
</script>

<div class="flex flex-col gap-3">
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
