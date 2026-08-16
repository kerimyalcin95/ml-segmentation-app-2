<script lang="ts">
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';
import {sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';

let lastMode: Mode = 'editing';

async function onValueChange(value: string) {
    if (value == '') {
        sessionStore.mode = lastMode;
    } else {
        lastMode = sessionStore.mode;
    }

    await localStorage.save();
}
</script>

<div data-e2e="mode-selector" class="absolute top-4 left-4 z-20">
    <Card class="p-1">
        <ToggleGroup.Root type="single" bind:value={sessionStore.mode} {onValueChange}>
            <ToggleGroup.Item
                value="editing"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Editing</ToggleGroup.Item
            >

            <ToggleGroup.Item
                value="labeling"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >Labeling</ToggleGroup.Item
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
