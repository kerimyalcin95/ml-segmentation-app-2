<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import Slider from '$lib/components/ui/slider/slider.svelte';

import * as localStorage from '$lib/utils/localStorage';

function handleValidationChange(value: number): void {
    sessionStore.training.validationPercent = value;
}

function handleValidationCommit(value: number): void {
    sessionStore.training.validationPercent = value;

    void localStorage.save();
}

function handleValidationInput(event: Event): void {
    const value = Number(
        (event.currentTarget as HTMLInputElement).value,
    );

    sessionStore.training.validationPercent = Math.max(
        0,
        Math.min(100, Math.round(value) || 0),
    );

    void localStorage.save();
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium"> DataLoader </span>

        <div class="flex flex-col gap-2">
            <Label for="dataloader-validation">
                Validation %
            </Label>

            <div class="flex items-center gap-3">
                <Slider
                    class="flex-1"
                    type="single"
                    min={0}
                    max={100}
                    step={1}
                    value={sessionStore.training.validationPercent}
                    onValueChange={handleValidationChange}
                    onValueCommit={handleValidationCommit}
                    disabled={sessionStore.training.running}
                />

                <div class="flex items-center gap-2">
                    <Input
                        id="dataloader-validation"
                        class="w-17 text-left"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={sessionStore.training.validationPercent}
                        oninput={handleValidationInput}
                        disabled={sessionStore.training.running}
                    />

                    <span class="text-sm text-muted-foreground">
                        %
                    </span>
                </div>
            </div>
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
                onchange={() => void localStorage.save()}
                placeholder="Optional"
                disabled={sessionStore.training.running}
            />
        </div>
    </div>
</Card>