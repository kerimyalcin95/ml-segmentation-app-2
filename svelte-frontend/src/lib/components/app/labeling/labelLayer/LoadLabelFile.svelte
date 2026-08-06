<script lang="ts">
import { Button } from '$lib/components/ui/button';

import TagSimpleIcon from 'phosphor-svelte/lib/TagSimpleIcon';

import { CanvasManager } from '$lib/canvas/canvas';

import type { ActiveLabel } from '$lib/types/label';

interface Props {
    canvas: CanvasManager;
    activeLabels: ActiveLabel[];
    enabled: boolean;
}

let {
    canvas,
    activeLabels,
    enabled = false
}: Props = $props();

function saveLabels(): void {
    console.log(activeLabels);
}
</script>

<Button onclick={saveLabels} disabled={!enabled}>
    <TagSimpleIcon weight="bold" />
    Load Labels
</Button>