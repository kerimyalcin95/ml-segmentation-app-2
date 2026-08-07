<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';
import { documentSize } from '$lib/components/stores/canvasStore.svelte';

import ResizeIcon from 'phosphor-svelte/lib/ResizeIcon';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let width = $state(0);
let height = $state(0);

$effect(() => {
    width = documentSize.width;
    height = documentSize.height;
});

function resize() {
    canvas.document.resize(width, height);
}
</script>

<div class="flex flex-col gap-2 mb-2">
    <div class="flex gap-2">
        <Input
            type="number"
            placeholder="Width"
            disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
            bind:value={width}
        />

        <Input
            type="number"
            placeholder="Height"
            disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
            bind:value={height}
        />
    </div>

    <Button
        onclick={resize}
        disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        ><ResizeIcon weight="bold" />Resize</Button
    >
</div>
