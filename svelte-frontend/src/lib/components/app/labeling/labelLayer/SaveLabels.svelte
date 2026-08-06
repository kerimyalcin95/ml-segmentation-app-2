<script lang="ts">
import { Button } from '$lib/components/ui/button';

import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';

import { CanvasManager } from '$lib/canvas/canvas';

import type { ActiveLabel } from '$lib/types/label';

interface Props {
    canvas: CanvasManager;
    activeLabels: ActiveLabel[];
}

let {
    canvas,
    activeLabels,
}: Props = $props();

function saveLabels(): void {
    console.log(activeLabels);
}
</script>

<Button onclick={saveLabels}>
    <FloppyDiskIcon weight="bold" />
    Save Labels
</Button>