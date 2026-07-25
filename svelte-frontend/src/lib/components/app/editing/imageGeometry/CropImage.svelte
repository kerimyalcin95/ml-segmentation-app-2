<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let x = $state(0);
let y = $state(0);
let width = $state(0);
let height = $state(0);

function crop() {
    canvas.cropImage(x, y, width, height);
}
</script>

<div class="flex flex-col gap-2">
    <div class="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="X" bind:value={x} />

        <Input type="number" placeholder="Y" bind:value={y} />

        <Input type="number" placeholder="Width" bind:value={width} />

        <Input type="number" placeholder="Height" bind:value={height} />
    </div>

    <Button onclick={crop}>Crop</Button>
</div>
