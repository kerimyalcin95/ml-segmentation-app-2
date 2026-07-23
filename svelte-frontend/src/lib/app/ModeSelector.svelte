<script lang="ts">
import { onMount } from 'svelte';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';

interface Props {
    mode: Mode;
}

let { mode } = $props<Props>();

let lastMode: Mode = 'editing';

onMount(() => {
    if (!mode) {
        mode = 'editing';
    }
});

function onValueChange(value: string) {
    if (value == '') {
        mode = lastMode;
    } else {
        lastMode = mode;
    }
}
</script>

<div class="absolute top-4 left-4 z-20">
    <Card class="p-1">
        <ToggleGroup.Root type="single" bind:value={mode} {onValueChange}>
            <ToggleGroup.Item
                value="editing"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Editing</ToggleGroup.Item
            >

            <ToggleGroup.Item
                value="annotation"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Annotation</ToggleGroup.Item
            >

            <ToggleGroup.Item
                value="training"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Training</ToggleGroup.Item
            >

            <ToggleGroup.Item
                value="prediction"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Prediction</ToggleGroup.Item
            >
        </ToggleGroup.Root>
    </Card>
</div>
