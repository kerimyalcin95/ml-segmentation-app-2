<script lang="ts">
import { onMount } from 'svelte';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';

export let mode: Mode;
let lastMode: Mode = 'editing';

onMount(() => {
    if (!mode) {
        mode = 'editing';
    }
});

function onValueChange(value: string) {
    if (value == '') {
        mode = lastMode;
    }
    else {
        lastMode = mode;
    }
}
</script>

<Card class="p-1">
    <ToggleGroup.Root type="single" bind:value={mode} {onValueChange}>
        <ToggleGroup.Item value="editing">Editing</ToggleGroup.Item>

        <ToggleGroup.Item value="annotation">Annotation</ToggleGroup.Item>

        <ToggleGroup.Item value="training">Training</ToggleGroup.Item>

        <ToggleGroup.Item value="prediction">Prediction</ToggleGroup.Item>
    </ToggleGroup.Root>
</Card>
