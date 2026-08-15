<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium">
            DataLoader
        </span>

        <div class="flex flex-col gap-1">
            <Label for="dataloader-validation">
                Validation %
            </Label>

            <Input
                id="dataloader-validation"
                type="number"
                min="0"
                max="100"
                step="1"
                bind:value={sessionStore.training.validationPercent}
                disabled={sessionStore.training.running}
            />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="dataloader-seed">
                Seed
            </Label>

            <Input
                id="dataloader-seed"
                type="number"
                min="0"
                step="1"
                bind:value={sessionStore.training.seed}
                placeholder="Optional"
                disabled={sessionStore.training.running}
            />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="dataloader-codes">
                Codes
            </Label>

            <Input
                id="dataloader-codes"
                bind:value={sessionStore.training.codesPath}
                disabled={sessionStore.training.running}
            />
        </div>
    </div>
</Card>