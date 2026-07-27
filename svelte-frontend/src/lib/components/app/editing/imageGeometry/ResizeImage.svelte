<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';
import { documentSize } from '$lib/components/stores/canvasStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let newWidth = $state(0);
let newHeight = $state(0);

$effect(() => {
    newWidth = documentSize.width;
    newHeight = documentSize.height;
});

function resize() {
    canvas.resizeImage(Number(newWidth), Number(newHeight));
}
</script>

<div class="flex flex-col gap-2">
    <div class="flex gap-2">
        <Input type="number" placeholder="Width" bind:value={newWidth} />

        <Input type="number" placeholder="Height" bind:value={newHeight} />
    </div>

    <Button onclick={resize}>Resize</Button>
</div>
