<script lang="ts">
import { Card } from '$lib/components/ui/card';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import TerminalWindowIcon from 'phosphor-svelte/lib/TerminalWindowIcon';
import RectangleIcon from 'phosphor-svelte/lib/RectangleIcon';

import type { WorkspaceViewMode } from '$lib/types/workspace';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';

let lastMode: WorkspaceViewMode = 'canvas';

async function onValueChange(value: string) {
    if (value === '') {
        sessionStore.viewMode = lastMode;
    } else {
        lastMode = sessionStore.viewMode;
    }

    await localStorage.save();
}
</script>

<div data-e2e="workspace-toggle" class="absolute top-4 right-4 z-20">
    <Card class="p-1">
        <ToggleGroup.Root
            type="single"
            bind:value={sessionStore.viewMode}
            {onValueChange}
        >
            <ToggleGroup.Item
                value="canvas"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
                <RectangleIcon class="size-5" weight="bold" />
            </ToggleGroup.Item>

            <ToggleGroup.Item
                value="terminal"
                class="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
                <TerminalWindowIcon class="size-5" weight="bold" />
            </ToggleGroup.Item>
        </ToggleGroup.Root>
    </Card>
</div>
