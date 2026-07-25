<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Slider } from '$lib/components/ui/slider';

import type { Filter } from '$lib/types/filter';

interface Props {
    currentFilter?: Filter;
}

let { currentFilter }: Props = $props();
</script>

<Card class="p-4">
    <h3 class="font-medium mb-1">Filter Settings</h3>

    {#if currentFilter}
        <div class="space-y-3">
            <div class="text-sm">
                {currentFilter.name}
            </div>

            <Slider
                type="single"
                min={0}
                max={100}
                step={1}
                bind:value={currentFilter.value}
            />

            <div class="text-xs text-muted-foreground">
                Value: {currentFilter.value}
            </div>
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">
            Select a filter.
        </p>
    {/if}
</Card>